<script setup lang="ts">
const { data: concerts } = await useAsyncData('concerts-upcoming', () =>
  queryCollection('concerts').order('date', 'ASC').all()
)

const upcoming = computed(() => {
  const now = Date.now()
  return (concerts.value ?? []).filter((c) => {
    const t = new Date(c.date).getTime()
    return !Number.isNaN(t) && t >= now
  })
})

const nextPath = computed(() => upcoming.value[0]?.path)

const SERIES_ORDER = ['Masterworks', 'Pops', 'Baroque & Beyond', 'Family']

const seriesId = (series: string) =>
  'series-' + series.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const grouped = computed(() => {
  const bySeries = new Map<string, typeof upcoming.value>()
  for (const concert of upcoming.value) {
    const key = concert.series ?? 'Other'
    if (!bySeries.has(key)) bySeries.set(key, [])
    bySeries.get(key)!.push(concert)
  }

  const ordered: { series: string; id: string; concerts: typeof upcoming.value }[] = []
  for (const series of SERIES_ORDER) {
    const list = bySeries.get(series)
    if (list) {
      ordered.push({ series, id: seriesId(series), concerts: list })
      bySeries.delete(series)
    }
  }
  for (const [series, list] of bySeries) {
    ordered.push({ series, id: seriesId(series), concerts: list })
  }
  return ordered
})

useSeoMeta({
  title: 'Kitchener Waterloo Symphony',
  description: 'Concerts and events from the Kitchener Waterloo Symphony, serving the Waterloo Region for 75 years.'
})
</script>

<template>
  <div class="bg-paper-50">
    <div class="max-w-[1800px] mx-auto px-6 lg:px-10 xl:px-14 py-10 lg:py-14">
      <header
        v-if="upcoming.length"
        class="mb-8 lg:mb-10 pb-5 border-b border-paper-300"
      >
        <div class="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <h1 class="font-display text-3xl lg:text-[2.5rem] font-semibold tracking-tight text-paper-900">
            Concerts &amp; events
          </h1>
          <p class="font-sans text-base text-paper-600">
            <span class="font-semibold text-paper-900">{{ upcoming.length }}</span>
            {{ upcoming.length === 1 ? 'concert' : 'concerts' }} ·
            <span class="text-paper-700">Machine Magic · 2026 / 27 season</span>
          </p>
        </div>
      </header>

      <div v-if="upcoming.length" class="space-y-12 lg:space-y-16">
        <section
          v-for="group in grouped"
          :key="group.series"
          :aria-labelledby="group.id"
        >
          <h2
            :id="group.id"
            class="font-display text-2xl lg:text-3xl font-semibold tracking-tight text-paper-900 mb-5 lg:mb-6"
          >
            {{ group.series }}
          </h2>

          <ul class="grid gap-6 lg:gap-7 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <li v-for="concert in group.concerts" :key="concert.path" class="flex">
              <ConcertCard
                class="w-full"
                :title="concert.title"
                :date="concert.date"
                :venue="concert.venue"
                :image="concert.image"
                :description="concert.description"
                :slug="concert.path"
                :ticket-url="concert.ticketUrl"
                :ticket-provider="concert.ticketProvider"
                :series="concert.series"
                :featured="concert.path === nextPath"
              />
            </li>
          </ul>
        </section>
      </div>

      <section
        v-else
        aria-label="No upcoming concerts"
        class="py-20 lg:py-28 text-center"
      >
        <h1 class="font-display text-3xl lg:text-4xl font-semibold tracking-tight text-paper-900 max-w-2xl mx-auto leading-[1.15]">
          The next programme is being prepared.
        </h1>
        <p class="mt-5 max-w-xl mx-auto font-sans text-lg leading-[1.55] text-paper-700">
          The season concludes shortly. Sign up for season announcements,
          revisit past programmes, or reach the box office while we finalize
          the year ahead.
        </p>
        <div class="mt-9 flex flex-wrap items-center justify-center gap-4">
          <NuxtLink
            to="/contact"
            class="inline-flex items-center justify-center px-6 py-3 min-h-[3rem] bg-paper-900 text-paper-50 font-sans font-semibold rounded-sm no-underline hover:bg-mulberry-800 transition-colors"
          >
            Contact the box office
          </NuxtLink>
          <NuxtLink
            to="/donate"
            class="inline-flex items-center justify-center px-6 py-3 min-h-[3rem] border-2 border-paper-900 text-paper-900 font-sans font-semibold rounded-sm no-underline hover:bg-paper-900 hover:text-paper-50 transition-colors"
          >
            Support the KWS
          </NuxtLink>
        </div>
      </section>
    </div>
  </div>
</template>
