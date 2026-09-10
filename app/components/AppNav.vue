<script setup lang="ts">
const links = [
  { label: 'Concerts', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Community', to: '/community' },
  { label: 'Donate', to: '/donate' },
  { label: 'Contact', to: '/contact' }
]

const route = useRoute()
const open = ref(false)
const toggleBtn = ref<HTMLButtonElement | null>(null)

function isActive(to: string) {
  if (to === '/') return route.path === '/' || route.path.startsWith('/concerts')
  return route.path === to || route.path.startsWith(to + '/')
}

// Close via Escape and return focus to the toggle, so focus isn't lost when the
// menu region unmounts.
function onEscape() {
  if (!open.value) return
  open.value = false
  nextTick(() => toggleBtn.value?.focus())
}

// Close the mobile menu after navigating.
watch(() => route.path, () => { open.value = false })
</script>

<template>
  <header class="border-b border-paper-200 bg-paper-50" @keydown.esc="onEscape">
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

      <!-- Tighter link padding and gap between md and lg. The five labels plus
           the logo need 813px at the lg spacing, so from 768px (where this row
           replaces the menu button) to about 813px the last link ran off the
           right edge and the page scrolled sideways - 768px being iPad
           portrait, not a hypothetical width. The lg spacing returns at
           1024px, and the labels are hardcoded, so this fits by measurement
           rather than by luck. -->
      <nav class="hidden md:block" aria-label="Primary">
        <ul class="flex items-center gap-1 lg:gap-2">
          <li v-for="link in links" :key="link.to">
            <NuxtLink
              :to="link.to"
              :class="[
                'inline-flex items-center px-2 py-2 text-base no-underline transition-colors lg:px-3',
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
        ref="toggleBtn"
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
        <p><a href="mailto:info@kwsymphony.com">info@kwsymphony.com</a></p>
        <p>c/o Catalyst Commons, 210-137 Glasgow St, Office# 315, Kitchener, ON N2G&nbsp;4X8</p>
      </div>
    </div>
  </header>
</template>
