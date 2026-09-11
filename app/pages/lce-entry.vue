<script setup lang="ts">
// Staff-only entry screen for learning and community engagement events. Not
// linked from anywhere in the site navigation; the coordinator is given the URL
// directly. Access is the existing Studio session, so there is no second login
// to run: adding an address to STUDIO_GOOGLE_MODERATORS grants both.
//
// The page is prerendered (see nitro.prerender.routes), so the session check
// has to happen on the client. It's a convenience gate only — POST
// /api/lce-events does the real enforcement.

// noindex comes from the `robots: false` route rule in nuxt.config, so it lands
// in robots.txt as well as the meta tag. Don't also set it here or the tag is
// emitted twice.
useSeoMeta({
  title: "Add a community event",
});

// Keep the Studio editor chrome off this page. nuxt-studio mounts it on every
// route once a session exists, so the class is the hook for the rule in
// main.css. Scoped to this route: useHead removes it again on navigate away.
//
// The inline script deals with the other half of the same problem. Studio
// persists the last-edited file in localStorage as `studio-active`; on mount it
// restores that location and, with syncEditorAndRoute on (the default), pushes
// the host app to the file's route. On a hard load of /lce-entry that bounces
// the coordinator to /about with no form. The redirect lives in Studio's
// minified app bundle, so it can't be intercepted from a component — clearing
// the active flag before any module script parses is what stops it. Studio sets
// the same flag to false whenever the sidebar is closed, so this is a state it
// already expects.
useHead({
  bodyAttrs: { class: "kws-no-studio-editor" },
  script: [
    {
      innerHTML:
        'try{var k="studio-active",v=localStorage.getItem(k);if(v){var s=JSON.parse(v);if(s&&s.active){s.active=false;localStorage.setItem(k,JSON.stringify(s))}}}catch(e){}',
    },
  ],
});

interface StudioSessionUser {
  name: string;
  email: string;
}

const user = ref<StudioSessionUser | null>(null);
const checkingSession = ref(true);

onMounted(async () => {
  try {
    const session = await $fetch<{ user?: StudioSessionUser }>(
      "/__nuxt_studio/auth/session",
    );
    user.value = session.user ?? null;
  } catch {
    user.value = null;
  } finally {
    checkingSession.value = false;
  }
});

function signIn() {
  // Studio reads this cookie after the Google round trip and returns here
  // instead of dropping the coordinator on the home page.
  document.cookie = "studio-redirect=%2Flce-entry; path=/";
  window.location.href = "/__nuxt_studio/auth/google";
}

const form = reactive({
  title: "",
  date: "",
  time: "",
  location: "",
  description: "",
  linkUrl: "",
  imageCredit: "",
});

const imageFile = ref<File | null>(null);
const imagePreview = ref<string | null>(null);
const formRef = ref<HTMLFormElement | null>(null);
const errorSummaryRef = ref<HTMLDivElement | null>(null);

const fieldErrors = ref<Record<string, string[]>>({});
const submitError = ref("");
const submitting = ref(false);
const published = ref(false);

function onImageChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0] ?? null;
  imageFile.value = file;
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value);
  imagePreview.value = file ? URL.createObjectURL(file) : null;
}

/**
 * Downscale and re-encode before upload. This is the "automatic processing" the
 * entry screen promises: a phone photo goes in, something the repo and the
 * image CDN can work with comes out, and the request stays well under
 * Netlify's function payload limit.
 */
async function processImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.85),
  );
  if (!blob) throw new Error("Could not read that image.");

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

  return { type: "image/jpeg" as const, data: dataUrl.split(",")[1]! };
}

// One row per field: the input id, the key the API returns errors under, the
// label the error summary links with, and the messages. The messages match the
// zod ones in server/api/lce-events.post.ts word for word, so a field reads the
// same whether the browser caught it or the server did. Nothing here uses
// `el.validationMessage`: that text is the browser's, not ours ("Fill out this
// field" in Firefox, "Please fill out this field." in Chrome), it names the
// gesture rather than the thing being asked for, and it changes under us.
interface FieldSpec {
  id: string;
  key: string;
  label: string;
  /** Shown when the control is required and empty. */
  missing?: string;
  /** Shown for anything else the control rejects: a half-typed date, a link
   *  that isn't a URL. Falls back to a generic line, because a submit that
   *  neither publishes nor says why is the worst outcome here. */
  invalid?: string;
}

const FIELDS: FieldSpec[] = [
  { id: "event-title", key: "title", label: "Event title", missing: "Add a title." },
  {
    id: "event-date",
    key: "date",
    label: "Date",
    missing: "Choose a date.",
    invalid: "Enter a complete date, or pick one from the calendar.",
  },
  {
    id: "event-time",
    key: "time",
    label: "Start time",
    invalid: "Enter a complete time, or leave this blank.",
  },
  { id: "event-location", key: "location", label: "Location", missing: "Add a location." },
  { id: "event-description", key: "description", label: "Description" },
  {
    id: "event-link",
    key: "linkUrl",
    label: "Link",
    invalid: "Enter a full web address, starting with https://",
  },
  { id: "event-image-credit", key: "imageCredit", label: "Photo credit" },
];

const FIELD_BY_ID = Object.fromEntries(FIELDS.map((f) => [f.id, f]));

// The summary lists only fields that actually have an error, in form order, so
// the list reads top to bottom the way the form does.
const errorList = computed(() =>
  FIELDS.flatMap((field) => {
    const message = fieldErrors.value[field.key]?.[0];
    return message ? [{ id: field.id, label: field.label, message }] : [];
  }),
);

function focusField(id: string) {
  document.getElementById(id)?.focus();
}

async function onSubmit() {
  const element = formRef.value;
  if (!element) return;

  fieldErrors.value = {};
  submitError.value = "";

  if (!element.checkValidity()) {
    // Don't fall back to reportValidity(). Its bubble is transient, covers
    // only the first invalid field, and leaves aria-invalid false, so a
    // screen reader user tabbing back through the form afterwards has no way
    // to tell which fields are wrong (SC 3.3.1). Fill fieldErrors from the
    // validity state instead, so the per-field error text and the role="alert"
    // summary already wired for server errors run on this path too.
    fieldErrors.value = Object.fromEntries(
      // Cast so the shared constraint-validation members resolve; every
      // control this form contains has them.
      Array.from(element.elements as HTMLCollectionOf<HTMLInputElement>)
        .filter((el) => el.willValidate && !el.validity.valid)
        .flatMap((el) => {
          const field = FIELD_BY_ID[el.id];
          if (!field) return [];
          const message =
            (el.validity.valueMissing ? field.missing : field.invalid) ??
            field.invalid ??
            "Check this field.";
          return [[field.key, [message]] as const];
        }),
    );
    submitError.value = "";
    await nextTick();
    errorSummaryRef.value?.focus();
    return;
  }

  submitting.value = true;
  try {
    const image = imageFile.value
      ? await processImage(imageFile.value)
      : undefined;
    await $fetch("/api/lce-events", {
      method: "POST",
      body: { ...form, image },
    });
    published.value = true;
  } catch (error: unknown) {
    const body = (error as { data?: { statusMessage?: string; data?: { errors?: Record<string, string[]> } } }).data;
    fieldErrors.value = body?.data?.errors ?? {};
    // A field-level failure is already spelled out in the summary list; only a
    // whole-request failure needs a sentence of its own.
    submitError.value = Object.keys(fieldErrors.value).length
      ? ""
      : (body?.statusMessage ??
        "The event couldn't be published. Try again, or contact the web team.");
    await nextTick();
    errorSummaryRef.value?.focus();
  } finally {
    submitting.value = false;
  }
}

function addAnother() {
  Object.assign(form, {
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    linkUrl: "",
    imageCredit: "",
  });
  imageFile.value = null;
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value);
  imagePreview.value = null;
  published.value = false;
}

onBeforeUnmount(() => {
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value);
});

// `min-w-0` is load-bearing for the date and time inputs. They sit in a grid,
// whose items default to `min-width: auto`, and a native date or time control
// carries an intrinsic width that on iOS is wider than a phone's reading
// column. The track sized itself to that intrinsic width and both fields ran
// off the right edge of the page; every other field, being a plain block, was
// fine. Zeroing the minimum lets `w-full` win.
const FIELD_BASE =
  "mt-1 w-full min-w-0 bg-paper-50 px-3 py-2.5 text-base text-paper-900 placeholder:text-paper-500";

// A field in error is framed rather than tinted: the palette is achromatic, so
// the 2px ink border is the one weight in the form that reads as "this one",
// the same device the featured concert card uses.
const fieldClass = (invalid = false) =>
  `${FIELD_BASE} ${invalid ? "border-2 border-paper-900" : "border border-paper-500"}`;
const labelClass = "block text-sm font-semibold text-paper-700";
const hintClass = "mt-1 text-sm text-paper-700";
const errorClass = "mt-1 text-base font-semibold text-paper-900";

const hasErrors = computed(() => errorList.value.length > 0 || !!submitError.value);
</script>

<template>
  <div class="mx-auto max-w-shell px-6 py-12 lg:px-10">
    <h1
      class="font-display text-3xl font-bold tracking-tight text-paper-900 sm:text-4xl"
    >
      Add a community event
    </h1>

    <div class="mt-8 max-w-reading">
      <p v-if="checkingSession" class="text-lg text-paper-700" role="status">
        Checking your sign-in…
      </p>

      <div v-else-if="!user" class="border-2 border-paper-900 p-5">
        <h2 class="font-display text-xl font-semibold text-paper-900">
          Sign in to continue
        </h2>
        <p class="mt-1 text-base text-paper-700">
          Use the KWS Google account you were set up with.
        </p>
        <button
          type="button"
          class="mt-4 inline-flex min-h-[3.25rem] items-center justify-center border-2 border-paper-900 bg-paper-900 px-7 py-3.5 font-semibold text-paper-50 transition-colors hover:bg-paper-50 hover:text-paper-900"
          @click="signIn"
        >
          Sign in with Google
        </button>
      </div>

      <div
        v-else-if="published"
        class="border-2 border-paper-900 p-5"
        role="status"
      >
        <h2 class="font-display text-xl font-semibold text-paper-900">
          Published.
        </h2>
        <p class="mt-1 text-base text-paper-700">
          The event is saved. The site rebuilds itself before it shows up, which
          usually takes a few minutes, so
          <NuxtLink to="/community">the community page</NuxtLink> won't list it
          the instant you look.
        </p>
        <button
          type="button"
          class="mt-4 inline-flex min-h-[3.25rem] items-center justify-center border-2 border-paper-900 px-7 py-3.5 font-semibold text-paper-900 transition-colors hover:bg-paper-900 hover:text-paper-50"
          @click="addAnother"
        >
          Add another event
        </button>
      </div>

      <template v-else>
        <p class="text-base text-paper-700 sm:text-lg">
          Signed in as {{ user.name }}. Events publish straight to the site, so
          check the details before you submit.
        </p>

        <form
          ref="formRef"
          novalidate
          class="mt-6 space-y-5"
          @submit.prevent="onSubmit"
        >
          <!-- Named problems, each a link to the field that has it. On a phone
               the offending field is often several screens down, so a summary
               that only said "check the highlighted fields below" left the
               coordinator to hunt for them. -->
          <div
            v-if="hasErrors"
            ref="errorSummaryRef"
            tabindex="-1"
            class="border-2 border-paper-900 bg-paper-100 p-4"
            role="alert"
          >
            <p class="text-base font-semibold text-paper-900">
              {{
                errorList.length === 1
                  ? "One thing needs fixing before this can publish"
                  : "There's a problem with the form"
              }}
            </p>
            <ul v-if="errorList.length" class="mt-3 space-y-2">
              <li v-for="item in errorList" :key="item.id">
                <a
                  :href="`#${item.id}`"
                  class="text-base font-medium text-paper-900"
                  @click="focusField(item.id)"
                  >{{ item.label }}: {{ item.message }}</a
                >
              </li>
            </ul>
            <p v-if="submitError" class="mt-2 text-base text-paper-700">
              {{ submitError }}
            </p>
          </div>

          <div>
            <label :class="labelClass" for="event-title"
              >Event title (required)</label
            >
            <input
              id="event-title"
              v-model="form.title"
              type="text"
              required
              maxlength="200"
              :class="fieldClass(Boolean(fieldErrors.title))"
              :aria-invalid="Boolean(fieldErrors.title)"
              :aria-describedby="fieldErrors.title ? 'event-title-error' : undefined"
            />
            <p v-if="fieldErrors.title" id="event-title-error" :class="errorClass">
              {{ fieldErrors.title[0] }}
            </p>
          </div>

          <div class="grid gap-5 sm:grid-cols-2">
            <div class="min-w-0">
              <label :class="labelClass" for="event-date">Date (required)</label>
              <input
                id="event-date"
                v-model="form.date"
                type="date"
                required
                :class="fieldClass(Boolean(fieldErrors.date))"
                :aria-invalid="Boolean(fieldErrors.date)"
                :aria-describedby="fieldErrors.date ? 'event-date-error' : undefined"
              />
              <p v-if="fieldErrors.date" id="event-date-error" :class="errorClass">
                {{ fieldErrors.date[0] }}
              </p>
            </div>
            <div class="min-w-0">
              <label :class="labelClass" for="event-time">Start time</label>
              <input
                id="event-time"
                v-model="form.time"
                type="time"
                :class="fieldClass(Boolean(fieldErrors.time))"
                :aria-invalid="Boolean(fieldErrors.time)"
                :aria-describedby="
                  fieldErrors.time ? 'event-time-error' : 'event-time-hint'
                "
              />
              <p v-if="fieldErrors.time" id="event-time-error" :class="errorClass">
                {{ fieldErrors.time[0] }}
              </p>
              <p v-else id="event-time-hint" :class="hintClass">
                Leave blank if the event has no set start time.
              </p>
            </div>
          </div>

          <div>
            <label :class="labelClass" for="event-location"
              >Location (required)</label
            >
            <input
              id="event-location"
              v-model="form.location"
              type="text"
              required
              maxlength="200"
              :class="fieldClass(Boolean(fieldErrors.location))"
              :aria-invalid="Boolean(fieldErrors.location)"
              :aria-describedby="fieldErrors.location ? 'event-location-error' : undefined"
            />
            <p
              v-if="fieldErrors.location"
              id="event-location-error"
              :class="errorClass"
            >
              {{ fieldErrors.location[0] }}
            </p>
          </div>

          <div>
            <label :class="labelClass" for="event-description"
              >Description</label
            >
            <textarea
              id="event-description"
              v-model="form.description"
              rows="6"
              maxlength="2000"
              :class="fieldClass(Boolean(fieldErrors.description))"
              :aria-invalid="Boolean(fieldErrors.description)"
              :aria-describedby="
                fieldErrors.description
                  ? 'event-description-error'
                  : 'event-description-hint'
              "
            />
            <p
              v-if="fieldErrors.description"
              id="event-description-error"
              :class="errorClass"
            >
              {{ fieldErrors.description[0] }}
            </p>
            <p v-else id="event-description-hint" :class="hintClass">
              Plain text. Formatting is applied by the site, not typed in here.
            </p>
          </div>

          <div>
            <label :class="labelClass" for="event-link">Link</label>
            <input
              id="event-link"
              v-model="form.linkUrl"
              type="url"
              inputmode="url"
              placeholder="https://"
              :class="fieldClass(Boolean(fieldErrors.linkUrl))"
              :aria-invalid="Boolean(fieldErrors.linkUrl)"
              :aria-describedby="
                fieldErrors.linkUrl ? 'event-link-error' : 'event-link-hint'
              "
            />
            <p v-if="fieldErrors.linkUrl" id="event-link-error" :class="errorClass">
              {{ fieldErrors.linkUrl[0] }}
            </p>
            <p v-else id="event-link-hint" :class="hintClass">
              Optional. Registration, tickets, or a partner's page.
            </p>
          </div>

          <div>
            <label :class="labelClass" for="event-image">Image</label>
            <input
              id="event-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              :class="fieldClass()"
              aria-describedby="event-image-hint"
              @change="onImageChange"
            />
            <p id="event-image-hint" :class="hintClass">
              Optional. Resized automatically, so upload the original.
            </p>
            <img
              v-if="imagePreview"
              :src="imagePreview"
              alt=""
              class="mt-3 max-h-56 border border-paper-500"
            />
          </div>

          <div v-if="imageFile">
            <label :class="labelClass" for="event-image-credit"
              >Photo credit</label
            >
            <input
              id="event-image-credit"
              v-model="form.imageCredit"
              type="text"
              maxlength="200"
              :class="fieldClass()"
            />
          </div>

          <button
            type="submit"
            :disabled="submitting"
            class="inline-flex min-h-[3.25rem] items-center justify-center border-2 border-paper-900 bg-paper-900 px-7 py-3.5 font-semibold text-paper-50 transition-colors hover:bg-paper-50 hover:text-paper-900 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-paper-900 disabled:hover:text-paper-50"
          >
            {{ submitting ? "Publishing…" : "Publish event" }}
          </button>
        </form>
      </template>
    </div>
  </div>
</template>
