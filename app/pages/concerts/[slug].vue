<script setup lang="ts">
const route = useRoute()

const { data: concert } = await useAsyncData(`concert-${route.path}`, () =>
  queryCollection('concerts').path(route.path).first()
)

if (!concert.value) {
  throw createError({ statusCode: 404, statusMessage: 'Concert not found', fatal: true })
}

const formattedDate = computed(() => {
  if (!concert.value?.date) return ''
  const d = new Date(concert.value.date)
  if (Number.isNaN(d.getTime())) return concert.value.date
  return d.toLocaleDateString('en-CA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const formattedTime = computed(() => {
  if (!concert.value?.date) return ''
  const d = new Date(concert.value.date)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('en-CA', {
    hour: 'numeric',
    minute: '2-digit'
  })
})

useSeoMeta({
  title: () => concert.value?.title,
  description: () => concert.value?.description
})
</script>

<template>
  <UContainer v-if="concert" class="py-12 max-w-4xl">
    <article class="space-y-8">
      <header class="space-y-4">
        <p
          v-if="concert.series"
          class="text-base font-semibold uppercase tracking-wide text-mulberry-700"
        >
          {{ concert.series }}
        </p>
        <h1 class="text-4xl font-bold">{{ concert.title }}</h1>
        <dl class="grid gap-2 sm:grid-cols-3 text-lg">
          <div>
            <dt class="font-semibold">Date</dt>
            <dd>{{ formattedDate }}</dd>
          </div>
          <div>
            <dt class="font-semibold">Time</dt>
            <dd>{{ formattedTime }}</dd>
          </div>
          <div>
            <dt class="font-semibold">Venue</dt>
            <dd>{{ concert.venue }}</dd>
          </div>
        </dl>
        <p class="text-lg leading-relaxed">{{ concert.description }}</p>
      </header>

      <figure class="space-y-2">
        <img
          :src="concert.image"
          :alt="concert.title"
          class="w-full aspect-video object-cover rounded-lg"
        >
        <figcaption v-if="concert.imageCredit" class="text-base text-paper-600">
          Photo: {{ concert.imageCredit }}
        </figcaption>
      </figure>

      <div>
        <TicketButton
          :url="concert.ticketUrl"
          :provider="concert.ticketProvider"
        />
      </div>

      <section
        v-if="concert.conductor || concert.artists?.length"
        aria-label="Performers"
        class="space-y-1 text-lg"
      >
        <p v-if="concert.conductor">
          <span class="font-semibold">Conductor</span> · {{ concert.conductor }}
        </p>
        <p v-for="artist in concert.artists" :key="artist.name">
          <span class="font-semibold">{{ artist.role }}</span> · {{ artist.name }}
        </p>
      </section>

      <div class="prose dark:prose-invert max-w-none">
        <ContentRenderer :value="concert" />
      </div>

      <div class="pt-4 border-t">
        <TicketButton
          :url="concert.ticketUrl"
          :provider="concert.ticketProvider"
        />
      </div>
    </article>
  </UContainer>
</template>
