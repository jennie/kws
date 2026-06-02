<script setup lang="ts">
withDefaults(defineProps<{
  url?: string
  provider?: string
  size?: 'md' | 'lg'
  label?: string
}>(), {
  size: 'md',
  label: 'Buy tickets'
})
</script>

<template>
  <a
    v-if="url"
    :href="url"
    target="_blank"
    rel="noopener noreferrer"
    :class="[
      'group inline-flex items-center justify-center gap-2.5 font-sans font-bold rounded-sm no-underline transition-colors',
      'bg-mulberry-700 text-paper-50 hover:bg-mulberry-800',
      size === 'lg'
        ? 'px-7 py-3.5 text-lg min-h-[3.25rem]'
        : 'px-5 py-2.5 text-base min-h-[3rem]'
    ]"
  >
    <span>{{ label }}</span>
    <svg
      aria-hidden="true"
      :width="size === 'lg' ? 22 : 18"
      :height="size === 'lg' ? 22 : 18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="square"
      stroke-linejoin="round"
    >
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
    <span class="sr-only"> (opens in a new tab)</span>
  </a>
  <span
    v-else
    :class="[
      'inline-flex items-center justify-center font-sans font-bold rounded-sm border-2 border-paper-300 text-paper-600',
      size === 'lg'
        ? 'px-7 py-3.5 text-lg min-h-[3.25rem]'
        : 'px-5 py-2.5 text-base min-h-[3rem]'
    ]"
  >
    On sale soon
  </span>
</template>
