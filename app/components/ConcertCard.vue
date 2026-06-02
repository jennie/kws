<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  date: string
  venue?: string
  image?: string
  description?: string
  slug: string
  ticketUrl?: string
  ticketProvider?: string
  series?: string
  featured?: boolean
}>(), {
  featured: false
})

const parsed = computed(() => {
  const d = new Date(props.date)
  return Number.isNaN(d.getTime()) ? null : d
})

const longDate = computed(() => {
  if (!parsed.value) return props.date
  return parsed.value.toLocaleDateString('en-CA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const time = computed(() =>
  parsed.value
    ? parsed.value.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' })
    : ''
)

const dayNumber = computed(() => (parsed.value ? parsed.value.getDate() : ''))

const isoDate = computed(() => (parsed.value ? parsed.value.toISOString() : props.date))

const imageBroken = ref(false)
const showImage = computed(() => !!props.image && !imageBroken.value)
const imgRef = ref<HTMLImageElement | null>(null)

onMounted(() => {
  const img = imgRef.value
  if (img && img.complete && !img.naturalWidth) {
    imageBroken.value = true
  }
})
</script>

<template>
  <article
    :class="[
      'group relative flex flex-col h-full bg-paper-50 border transition-colors',
      featured
        ? 'border-mulberry-700 border-2'
        : 'border-paper-300 hover:border-paper-500'
    ]"
  >
    <NuxtLink :to="slug" class="block aspect-[5/3] overflow-hidden bg-paper-900 no-underline relative">
      <div class="kws-card-fallback absolute inset-0 flex items-center justify-center text-paper-50">
        <span class="font-display text-[clamp(3.5rem,10cqw,6rem)] leading-none font-medium">
          {{ dayNumber }}
        </span>
      </div>
      <img
        v-if="showImage"
        ref="imgRef"
        :src="image"
        :alt="title"
        loading="lazy"
        class="absolute inset-0 w-full h-full object-cover"
        @error="imageBroken = true"
      >
    </NuxtLink>

    <div class="flex flex-col flex-1 p-5 lg:p-6">
      <p v-if="series" class="text-base text-paper-600 mb-2">
        {{ series }}
      </p>

      <h3 class="font-display text-2xl lg:text-[1.6rem] font-semibold leading-[1.15] tracking-tight text-paper-900">
        <NuxtLink :to="slug" class="no-underline hover:text-mulberry-700 transition-colors">
          {{ title }}
        </NuxtLink>
      </h3>

      <p class="mt-3 text-base text-paper-700">
        <time :datetime="isoDate">{{ longDate }} · {{ time }}</time>
      </p>
      <p v-if="venue" class="mt-1 text-base text-paper-700">
        {{ venue }}
      </p>

      <div class="mt-5 pt-4 border-t border-paper-200 flex items-center justify-between gap-3">
        <TicketButton
          :url="ticketUrl"
          :provider="ticketProvider"
          size="md"
        />
        <span
          v-if="featured"
          class="font-sans text-sm font-semibold text-mulberry-700"
        >
          Next concert
        </span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.kws-card-fallback {
  container-type: inline-size;
  background:
    radial-gradient(at 100% 0%, oklch(35% 0.11 22 / 0.55) 0%, transparent 60%),
    radial-gradient(at 0% 100%, oklch(18% 0.04 22 / 0.7) 0%, transparent 65%),
    var(--color-paper-900);
}
</style>
