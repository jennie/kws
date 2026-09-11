<script setup lang="ts">
const links = [
  { to: '/about', label: 'About' },
  { to: '/about/orchestra', label: 'Orchestra' },
  { to: '/about/jobs', label: 'Careers' }
]

const route = useRoute()
// Prerendered routes can be served with a trailing slash; normalize so the
// active item doesn't silently drop out.
const current = computed(() => route.path.replace(/\/$/, '') || '/')
</script>

<template>
  <nav aria-label="About section" class="mb-8 border-b border-paper-300 pb-4">
    <ul class="flex flex-wrap gap-x-6 gap-y-2">
      <li v-for="link in links" :key="link.to">
        <NuxtLink
          :to="link.to"
          :aria-current="current === link.to ? 'page' : undefined"
          class="inline-block py-1 -my-1 text-base no-underline hover:text-paper-900 hover:underline"
          :class="
            current === link.to
              ? 'font-semibold text-paper-900'
              : 'font-medium text-paper-700'
          "
        >
          {{ link.label }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
