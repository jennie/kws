<script setup lang="ts">
const links = [
  { label: 'Concerts', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Donate', to: '/donate' },
  { label: 'Contact', to: '/contact' }
]

const route = useRoute()
const open = ref(false)

function isActive(to: string) {
  if (to === '/') return route.path === '/' || route.path.startsWith('/concerts')
  return route.path === to || route.path.startsWith(to + '/')
}

// Close the mobile menu after navigating.
watch(() => route.path, () => { open.value = false })
</script>

<template>
  <header class="border-b border-paper-200 bg-paper-50">
    <div class="mx-auto flex max-w-shell items-center justify-between gap-6 px-6 py-5 lg:px-10">
      <NuxtLink
        to="/"
        class="shrink-0 no-underline"
        aria-label="Kitchener-Waterloo Symphony — Home"
      >
        <img
          src="/images/kws-logo.svg"
          alt=""
          class="hidden h-11 w-auto sm:block lg:h-12"
          width="2028"
          height="584"
        >
        <span class="font-display text-2xl font-semibold leading-none tracking-tight text-paper-900 sm:hidden">KWS</span>
      </NuxtLink>

      <nav class="hidden md:block" aria-label="Primary">
        <ul class="flex items-center gap-2">
          <li v-for="link in links" :key="link.to">
            <NuxtLink
              :to="link.to"
              :class="[
                'inline-flex items-center px-3 py-2 text-base no-underline transition-colors',
                isActive(link.to)
                  ? 'font-bold text-paper-900'
                  : 'font-medium text-paper-700 hover:text-paper-900'
              ]"
            >
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <button
        type="button"
        class="-mr-2 inline-flex h-11 w-11 items-center justify-center text-paper-900 md:hidden"
        :aria-expanded="open"
        aria-controls="mobile-menu"
        @click="open = !open"
      >
        <span class="sr-only">{{ open ? 'Close menu' : 'Open menu' }}</span>
        <svg v-if="!open" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
        <svg v-else width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </div>

    <div v-if="open" id="mobile-menu" class="border-t border-paper-200 px-6 pb-6 pt-2 md:hidden">
      <nav aria-label="Primary">
        <ul class="flex flex-col">
          <li v-for="link in links" :key="link.to">
            <NuxtLink
              :to="link.to"
              :class="[
                'block py-3 text-lg no-underline',
                isActive(link.to) ? 'font-bold text-paper-900' : 'font-medium text-paper-700'
              ]"
            >
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
      <div class="mt-4 border-t border-paper-200 pt-4 text-base text-paper-700">
        <p class="font-semibold text-paper-900">Box office</p>
        <p><a href="mailto:info@kwsymphony.com" class="hover:underline">info@kwsymphony.com</a></p>
        <p>14 Huntingwood Court, Kitchener</p>
      </div>
    </div>
  </header>
</template>
