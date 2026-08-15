<script setup lang="ts">
const props = defineProps<{
  name: string
  chair?: string
  photo?: string
}>()

const initials = computed(() => {
  const parts = props.name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1]![0] ?? '' : ''
  return (first + last).toUpperCase()
})

// Light end of the paper scale. The concert-card fallback is dark because it
// sits among photographs; a whole roster of dark tiles reads as a wall of
// black, and this page ships with no photos at all.
const TONES = ['--color-paper-100', '--color-paper-200', '--color-paper-300']

// Deterministic from the name: a musician's tile looks the same on every build,
// and the roster doesn't read as one flat block while it waits for photos.
const placeholder = computed(() => {
  let h = 0
  for (let i = 0; i < props.name.length; i++) h = (h * 31 + props.name.charCodeAt(i)) | 0
  h = Math.abs(h)
  const from = TONES[h % TONES.length]
  const to = TONES[(h + 1 + ((h >> 4) % (TONES.length - 1))) % TONES.length]
  const angle = 15 + ((h >> 8) % 6) * 30
  return `background:linear-gradient(${angle}deg, var(${from}) 0%, var(${to}) 100%);`
})
</script>

<template>
  <li class="flex flex-col">
    <NuxtImg
      v-if="photo"
      :src="photo"
      :alt="name"
      width="600"
      height="600"
      sizes="50vw sm:33vw lg:280px"
      format="webp"
      quality="80"
      :modifiers="{ fit: 'cover', position: 'top' }"
      loading="lazy"
      class="block aspect-square w-full border border-paper-300 object-cover"
    />
    <div
      v-else
      aria-hidden="true"
      :style="placeholder"
      class="flex aspect-square w-full items-center justify-center border border-paper-300"
    >
      <span class="font-display text-3xl font-semibold tracking-tight text-paper-600 sm:text-4xl">
        {{ initials }}
      </span>
    </div>

    <p class="mt-3 font-display text-base font-semibold leading-snug tracking-tight text-paper-900">
      {{ name }}
    </p>
    <p v-if="chair" class="mt-1 text-sm text-paper-600">
      {{ chair }}
    </p>
  </li>
</template>
