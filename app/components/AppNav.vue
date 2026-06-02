<script setup lang="ts">
const links = [
  { label: 'Concerts', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Donate', to: '/donate' },
  { label: 'Contact', to: '/contact' }
]

const route = useRoute()

function isActive(to: string) {
  if (to === '/') return route.path === '/' || route.path.startsWith('/concerts')
  return route.path === to || route.path.startsWith(to + '/')
}
</script>

<template>
  <header class="border-b border-paper-200 bg-paper-50">
    <div class="max-w-[1800px] mx-auto px-6 lg:px-10 xl:px-14 flex items-center justify-between gap-6 py-5">
      <NuxtLink
        to="/"
        class="font-display text-2xl md:text-[1.75rem] font-semibold leading-none tracking-tight text-paper-900 no-underline"
        aria-label="Kitchener Waterloo Symphony — Home"
      >
        <span class="hidden sm:inline">Kitchener Waterloo Symphony</span>
        <span class="sm:hidden">KWS</span>
      </NuxtLink>

      <nav aria-label="Primary">
        <ul class="flex items-center gap-1 sm:gap-2">
          <li v-for="link in links" :key="link.to">
            <NuxtLink
              :to="link.to"
              :class="[
                'inline-flex items-center px-3 py-2 rounded-sm font-sans text-base no-underline transition-colors',
                isActive(link.to)
                  ? 'text-mulberry-700 font-bold'
                  : 'text-paper-700 hover:text-mulberry-700 font-medium'
              ]"
            >
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>
