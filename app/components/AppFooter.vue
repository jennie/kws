<script setup lang="ts">
const email = ref('')

// Placeholder — MailChimp integration is not wired up yet.
function onSubscribe() {
  // intentionally empty
}
</script>

<template>
  <footer class="border-t border-paper-200">
    <UContainer class="py-12 grid gap-8 md:grid-cols-3">
      <div class="space-y-2">
        <h3 class="font-semibold">Kitchener Waterloo Symphony</h3>
        <address class="not-italic text-sm opacity-75 leading-relaxed">
          Placeholder Street Address<br>
          Kitchener, ON<br>
          Postal Code
        </address>
        <p class="text-sm opacity-75">
          Charitable registration #: <span>000000000-RR0000</span>
        </p>
      </div>

      <nav class="space-y-2">
        <h3 class="font-semibold">Explore</h3>
        <ul class="text-sm space-y-1">
          <li><NuxtLink to="/">Home</NuxtLink></li>
          <li><NuxtLink to="/about">About</NuxtLink></li>
          <li><NuxtLink to="/donate">Donate</NuxtLink></li>
          <li><NuxtLink to="/contact">Contact</NuxtLink></li>
        </ul>
      </nav>

      <div class="space-y-3">
        <h3 class="font-semibold">Newsletter</h3>
        <p class="text-sm opacity-75">
          Subscribe for season announcements and concert reminders.
        </p>
        <form class="flex flex-col gap-2 sm:flex-row" @submit.prevent="onSubscribe">
          <UInput
            v-model="email"
            type="email"
            placeholder="you@example.com"
            class="flex-1"
            required
          />
          <UButton type="submit">Subscribe</UButton>
        </form>
      </div>
    </UContainer>
  </footer>
</template>
