<script setup lang="ts">
withDefaults(defineProps<{
  url?: string
  provider?: string
  size?: 'sm' | 'md' | 'lg'
  block?: boolean
  label?: string
}>(), {
  size: 'md',
  block: false,
  label: 'Buy tickets'
})

const sizeClass = {
  sm: 'px-4 py-2 text-base min-h-[2.75rem]',
  md: 'px-5 py-2.5 text-base min-h-[3rem]',
  lg: 'px-7 py-3.5 text-lg min-h-[3.25rem]'
}
</script>

<template>
  <a
    v-if="url"
    :href="url"
    target="_blank"
    rel="noopener noreferrer"
    :class="[
      'group inline-flex items-center justify-center gap-2.5 font-sans font-bold no-underline border-2 transition-colors',
      'bg-paper-900 text-paper-50 border-paper-900 hover:bg-paper-50 hover:text-paper-900',
      sizeClass[size],
      block ? 'w-full' : ''
    ]"
  >
    <span>{{ label }}</span>
    <svg
      v-if="size !== 'sm'"
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
      'inline-flex items-center justify-center font-sans font-medium border-2 border-dashed border-paper-500 text-paper-600',
      sizeClass[size],
      block ? 'w-full' : ''
    ]"
  >
    On sale soon
  </span>
</template>
