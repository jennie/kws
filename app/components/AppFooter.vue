<template>
  <footer class="border-t border-paper-200">
    <div class="mx-auto grid max-w-shell gap-x-12 gap-y-8 px-6 py-12 md:grid-cols-[1.4fr_0.6fr_1.5fr] lg:px-10">
      <div class="space-y-2">
        <h3 class="font-semibold text-paper-900">Kitchener Waterloo Symphony</h3>
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

      <div class="space-y-3">
        <h3 class="font-semibold text-paper-900">Newsletter</h3>
        <p class="text-base text-paper-700">
          Subscribe for season announcements and concert reminders.
        </p>
        <form
          class="space-y-3"
          action="https://kwsymphony.us8.list-manage.com/subscribe/post?u=1135719e20fe09076414f20d6&id=bf756c6648&f_id=00e117e1f0"
          method="post"
          target="_blank"
        >
          <div class="flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              name="EMAIL"
              placeholder="you@example.com"
              required
              aria-label="Email address"
              class="min-h-[3rem] flex-1 border border-paper-500 bg-paper-50 px-3 py-2.5 text-base text-paper-900 placeholder:text-paper-500"
            >
            <button
              type="submit"
              class="inline-flex min-h-[3rem] items-center justify-center border-2 border-paper-900 bg-paper-900 px-6 py-2.5 font-semibold text-paper-50 transition-colors hover:bg-paper-50 hover:text-paper-900"
            >
              Subscribe
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
        </form>
      </div>
    </div>
  </footer>
</template>
