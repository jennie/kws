<script setup lang="ts">
interface Performance {
  date: string
  venue: string
  ticketUrl?: string
  ticketProvider?: string
}

const props = withDefaults(defineProps<{
  title: string
  date: string
  venue?: string
  image?: string
  slug: string
  ticketUrl?: string
  ticketProvider?: string
  series?: string
  conductor?: string
  artists?: { name: string; role: string }[]
  performances?: Performance[]
  featured?: boolean
}>(), {
  featured: false
})

const isTouring = computed(() => (props.performances?.length ?? 0) > 0)

const dayNumber = computed(() => {
  const d = new Date(props.date)
  return Number.isNaN(d.getTime()) ? '' : d.getDate()
})

const venueParts = computed(() => splitVenue(props.venue))

const performerLine = computed(() => {
  const parts: string[] = []
  if (props.conductor) parts.push(`${props.conductor}, conductor`)
  for (const a of props.artists ?? []) {
    const role = a.role.toLowerCase()
    parts.push(a.name.toLowerCase().includes(role) ? a.name : `${a.name}, ${role}`)
  }
  return parts.join(' · ')
})

const statusLabel = computed(() => {
  if (isTouring.value) return `${props.performances!.length} performances`
  if (props.featured) return 'Next concert'
  return props.ticketUrl ? 'On sale' : 'On sale soon'
})

const imageBroken = ref(false)
const showImage = computed(() => !!props.image && !imageBroken.value)
const imgRef = ref<HTMLImageElement | null>(null)

onMounted(() => {
  const img = imgRef.value
  if (img && img.complete && !img.naturalWidth) imageBroken.value = true
})
</script>

<template>
  <article class="group flex h-full flex-col border border-paper-300 bg-paper-50">
    <NuxtLink :to="slug" class="block no-underline" :aria-label="title">
      <img
        v-if="showImage"
        ref="imgRef"
        :src="image"
        :alt="title"
        loading="lazy"
        class="block aspect-[3/2] w-full object-cover object-[center_30%] border-b border-paper-300"
        @error="imageBroken = true"
      >
      <div
        v-else
        class="kws-card-fallback flex aspect-[3/2] items-center justify-center border-b border-paper-300 text-paper-50"
      >
        <span class="font-display text-[clamp(3.5rem,12cqw,6rem)] font-medium leading-none">
          {{ dayNumber }}
        </span>
      </div>
    </NuxtLink>

    <div class="flex flex-1 flex-col p-6">
      <div class="mb-3 flex items-baseline justify-between gap-3">
        <span v-if="series" class="text-base font-medium text-paper-600">{{ series }}</span>
        <span :style="`font-size:1rem;line-height:1.4;white-space:nowrap;text-transform:none;letter-spacing:normal;font-weight:${featured ? 600 : 500};color:var(${featured ? '--color-paper-900' : '--color-paper-600'});`">{{ statusLabel }}</span>
      </div>

      <h3 class="mb-4 font-display text-[1.85rem] font-semibold leading-[1.1] tracking-tight text-paper-900">
        <NuxtLink :to="slug" class="no-underline hover:underline">{{ title }}</NuxtLink>
      </h3>

      <template v-if="!isTouring">
        <dl class="mb-5">
          <dt class="kws-eyebrow mt-4 first:mt-0">
            Date
          </dt>
          <dd class="mt-1 text-sm text-paper-800">
            <time :datetime="isoDate(date)">{{ longDate(date) }} · {{ timeOf(date) }}</time>
          </dd>
          <template v-if="venue">
            <dt class="kws-eyebrow mt-4">
              Venue
            </dt>
            <dd class="mt-1 text-sm text-paper-800">
              {{ venueParts.name }}<br v-if="venueParts.city"><span v-if="venueParts.city" class="text-paper-600">{{ venueParts.city }}</span>
            </dd>
          </template>
        </dl>
        <p v-if="performerLine" class="mb-5 text-sm font-medium text-paper-600">{{ performerLine }}</p>
        <div class="mt-auto border-t border-paper-200 pt-5">
          <TicketButton :url="ticketUrl" :provider="ticketProvider" block />
        </div>
      </template>

      <template v-else>
        <p v-if="performerLine" class="mb-4 text-sm font-medium text-paper-600">{{ performerLine }}</p>
        <ul class="mt-auto">
          <li
            v-for="(p, i) in performances"
            :key="i"
            :class="[
              'grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3 py-4',
              i === 0 ? 'border-t border-paper-400' : 'border-t border-paper-200'
            ]"
          >
            <div>
              <span class="block text-sm font-semibold text-paper-900">
                <time :datetime="isoDate(p.date)">{{ shortDate(p.date) }} · {{ timeOf(p.date) }}</time>
              </span>
              <span class="block text-sm text-paper-600">{{ p.venue }}</span>
            </div>
            <TicketButton :url="p.ticketUrl" :provider="p.ticketProvider" size="sm" />
          </li>
        </ul>
      </template>
    </div>
  </article>
</template>

<style scoped>
.kws-card-fallback {
  container-type: inline-size;
  background:
    radial-gradient(at 100% 0%, oklch(35% 0.012 45 / 0.55) 0%, transparent 60%),
    radial-gradient(at 0% 100%, oklch(18% 0.01 45 / 0.7) 0%, transparent 65%),
    var(--color-paper-900);
}
</style>
