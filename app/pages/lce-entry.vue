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
useHead({
  bodyAttrs: { class: "kws-no-studio-editor" },
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

async function onSubmit() {
  const element = formRef.value;
  if (!element) return;

  fieldErrors.value = {};
  submitError.value = "";

  if (!element.checkValidity()) {
    element.reportValidity();
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
    submitError.value = Object.keys(fieldErrors.value).length
      ? "Check the highlighted fields below and try again."
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

const fieldClass =
  "mt-1 w-full border border-paper-500 bg-paper-50 px-3 py-2.5 text-base text-paper-900 placeholder:text-paper-500";
const labelClass = "block text-sm font-semibold text-paper-700";
const hintClass = "mt-1 text-sm text-paper-700";
const errorClass = "mt-1 text-sm font-semibold text-paper-900";
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
          The event is saved. It appears on the community page once the site
          finishes rebuilding, usually within a few minutes.
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
        <p class="text-lg text-paper-700">
          Signed in as {{ user.name }}. Events publish straight to the site, so
          check the details before you submit.
        </p>

        <form
          ref="formRef"
          novalidate
          class="mt-6 space-y-5"
          @submit.prevent="onSubmit"
        >
          <div
            v-if="submitError"
            ref="errorSummaryRef"
            tabindex="-1"
            class="border-2 border-paper-900 bg-paper-100 p-4"
            role="alert"
          >
            <p class="font-semibold text-paper-900">
              There's a problem with the form
            </p>
            <p class="text-base text-paper-700">{{ submitError }}</p>
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
              :class="fieldClass"
              :aria-invalid="Boolean(fieldErrors.title)"
              :aria-describedby="fieldErrors.title ? 'event-title-error' : undefined"
            />
            <p v-if="fieldErrors.title" id="event-title-error" :class="errorClass">
              {{ fieldErrors.title[0] }}
            </p>
          </div>

          <div class="grid gap-5 sm:grid-cols-2">
            <div>
              <label :class="labelClass" for="event-date">Date (required)</label>
              <input
                id="event-date"
                v-model="form.date"
                type="date"
                required
                :class="fieldClass"
                :aria-invalid="Boolean(fieldErrors.date)"
                :aria-describedby="fieldErrors.date ? 'event-date-error' : undefined"
              />
              <p v-if="fieldErrors.date" id="event-date-error" :class="errorClass">
                {{ fieldErrors.date[0] }}
              </p>
            </div>
            <div>
              <label :class="labelClass" for="event-time">Start time</label>
              <input
                id="event-time"
                v-model="form.time"
                type="time"
                :class="fieldClass"
                aria-describedby="event-time-hint"
              />
              <p id="event-time-hint" :class="hintClass">
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
              :class="fieldClass"
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
              :class="fieldClass"
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
              :class="fieldClass"
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
              :class="fieldClass"
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
              :class="fieldClass"
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
