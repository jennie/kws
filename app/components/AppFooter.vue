<script setup lang="ts">
// Inline newsletter feedback. The form keeps its native action/method/target,
// so it still posts to Mailchimp in a new tab if JS fails. With JS, we submit
// via Mailchimp's JSONP endpoint (no CORS) and report the result inline.
type Status = "idle" | "loading" | "success" | "error";
const status = ref<Status>("idle");
const message = ref("");

function onSubmit(event: Event) {
  const form = event.target as HTMLFormElement;
  const data = new URLSearchParams(new FormData(form) as unknown as string[][]);
  const callback = "kwsMcJsonp_" + Date.now();
  const url =
    form.action.replace("/post?", "/post-json?") +
    "&" +
    data.toString() +
    "&c=" +
    callback;

  status.value = "loading";
  message.value = "";

  const script = document.createElement("script");
  const cleanup = () => {
    delete (window as unknown as Record<string, unknown>)[callback];
    script.remove();
  };
  (window as unknown as Record<string, unknown>)[callback] = (response: {
    result: string;
    msg: string;
  }) => {
    if (response.result === "success") {
      status.value = "success";
      message.value = "Thanks. Check your inbox to confirm your subscription.";
      form.reset();
    } else {
      status.value = "error";
      message.value =
        response.msg?.replace(/<[^>]*>/g, "") ||
        "Something went wrong. Please try again.";
    }
    cleanup();
  };
  script.onerror = () => {
    status.value = "error";
    message.value = "Couldn't reach the newsletter service. Please try again.";
    cleanup();
  };
  script.src = url;
  document.body.appendChild(script);
}
</script>

<template>
  <footer class="border-t border-paper-200">
    <div class="mx-auto grid max-w-shell gap-x-12 gap-y-8 px-6 py-12 md:grid-cols-[1.4fr_0.6fr_1.5fr] lg:px-10">
      <div class="space-y-2">
        <h3 class="font-semibold text-paper-900">Kitchener-Waterloo Symphony</h3>
        <address class="text-base not-italic leading-relaxed text-paper-700">
          14 Huntingwood Court<br>
          Kitchener, ON<br>
          N2P 2A7
        </address>
        <p class="text-base text-paper-700">
          Box office: <a href="mailto:info@kwsymphony.com" class="hover:underline">info@kwsymphony.com</a>
        </p>
        <p class="text-base text-paper-700">Charitable registration #: <span style="white-space:nowrap">122524713 RR0001</span></p>
      </div>

      <nav class="space-y-2" aria-label="Footer">
        <h3 class="font-semibold text-paper-900">Explore</h3>
        <ul class="space-y-1 text-base">
          <li><NuxtLink to="/" class="text-paper-700 hover:underline">Home</NuxtLink></li>
          <li><NuxtLink to="/about" class="text-paper-700 hover:underline">About</NuxtLink></li>
          <li><NuxtLink to="/donate" class="text-paper-700 hover:underline">Donate</NuxtLink></li>
          <li><NuxtLink to="/contact" class="text-paper-700 hover:underline">Contact</NuxtLink></li>
        </ul>
      </nav>

      <div class="min-w-0 space-y-3">
        <h3 class="font-semibold text-paper-900">Newsletter</h3>
        <p class="text-base text-paper-700">
          Subscribe for season announcements and concert reminders.
        </p>
        <form
          class="space-y-3"
          action="https://kwsymphony.us8.list-manage.com/subscribe/post?u=1135719e20fe09076414f20d6&id=bf756c6648&f_id=00e117e1f0"
          method="post"
          target="_blank"
          @submit.prevent="onSubmit"
        >
          <div class="flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              name="EMAIL"
              placeholder="you@example.com"
              required
              aria-label="Email address"
              class="min-h-12 w-full min-w-0 flex-1 border border-paper-500 bg-paper-50 px-3 py-2.5 text-base text-paper-900 placeholder:text-paper-600"
            >
            <button
              type="submit"
              :disabled="status === 'loading'"
              class="inline-flex min-h-12 items-center justify-center border-2 border-paper-900 bg-paper-900 px-6 py-2.5 font-semibold text-paper-50 transition-colors hover:bg-paper-50 hover:text-paper-900 disabled:cursor-default"
            >
              {{ status === "loading" ? "Subscribing…" : "Subscribe" }}
            </button>
          </div>
          <input type="hidden" name="tags" value="3169692">
          <!-- Mailchimp anti-bot honeypot; real users leave it empty -->
          <div aria-hidden="true" class="absolute -left-[5000px]">
            <input
              type="text"
              name="b_1135719e20fe09076414f20d6_bf756c6648"
              tabindex="-1"
              value=""
              autocomplete="off"
            >
          </div>
          <!-- CASL express consent: unbundled, unchecked by default, required -->
          <label class="flex items-start gap-2 text-base text-paper-700">
            <input type="checkbox" required class="mt-1.5 size-4 shrink-0 accent-paper-900">
            <span>I agree to receive email updates from the KWS. You can unsubscribe at any time.</span>
          </label>
          <p
            v-if="message"
            role="status"
            aria-live="polite"
            class="text-base font-medium text-paper-900"
            :class="status === 'error' ? 'border-l-2 border-paper-900 pl-3' : ''"
          >
            {{ message }}
          </p>
        </form>
      </div>
    </div>
  </footer>
</template>
