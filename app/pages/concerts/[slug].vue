<script setup lang="ts">
const route = useRoute()

const { data: concert } = await useAsyncData(`concert-${route.path}`, () =>
  queryCollection('concerts').path(route.path).first()
)

if (!concert.value) {
  throw createError({ statusCode: 404, statusMessage: 'Concert not found', fatal: true })
}

const { data: allConcerts } = await useAsyncData('concerts-all', () =>
  queryCollection('concerts').order('date', 'ASC').all()
)

const isTouring = computed(() => (concert.value?.performances?.length ?? 0) > 0)

const moreInSeries = computed(() =>
  (allConcerts.value ?? [])
    .filter((c) => c.series && c.series === concert.value?.series && c.path !== concert.value?.path)
    .slice(0, 3)
)

useSeoMeta({
  title: () => concert.value?.title,
  description: () => concert.value?.description
})
</script>

<template>
  <article v-if="concert" class="mx-auto max-w-shell px-6 py-12 lg:px-10">
    <div class="max-w-reading">
      <NuxtLink to="/" class="inline-block text-base font-medium text-paper-700 no-underline hover:text-paper-900 hover:underline">
        ← All concerts
      </NuxtLink>

      <p v-if="concert.series" class="mt-8 text-base font-medium text-paper-600">
        {{ concert.series }}
      </p>
      <h1 class="mt-2 font-display text-4xl font-bold leading-[1.05] tracking-tight text-paper-900 lg:text-5xl">
        {{ concert.title }}
      </h1>

      <!-- Single-date meta -->
      <dl v-if="!isTouring" class="mt-8 space-y-2">
        <div>
          <dt class="sr-only">Date and time</dt>
          <dd class="text-lg text-paper-800">{{ longDate(concert.date) }} · {{ timeOf(concert.date) }}</dd>
        </div>
        <div>
          <dt class="sr-only">Venue</dt>
          <dd class="text-lg text-paper-800">{{ concert.venue }}</dd>
        </div>
      </dl>

      <p v-if="concert.description" class="mt-8 text-lg leading-relaxed text-paper-800">
        {{ concert.description }}
      </p>
    </div>

    <figure class="mt-8 max-w-4xl">
      <NuxtImg
        :src="concert.image"
        :alt="concert.title"
        width="896"
        height="504"
        sizes="100vw md:896px"
        preload
        fetchpriority="high"
        class="aspect-video w-full border border-paper-300 object-cover"
      />
      <figcaption v-if="concert.imageCredit" class="mt-2 text-sm text-paper-600">
        Photo: {{ concert.imageCredit }}
      </figcaption>
    </figure>

    <div v-if="!isTouring" class="mt-8 max-w-reading">
      <TicketButton :url="concert.ticketUrl" :provider="concert.ticketProvider" size="lg" />
    </div>

    <!-- Touring: performances block replaces single date/venue + CTA -->
    <section v-else class="mt-10 max-w-reading" aria-labelledby="performances">
      <h2 id="performances" class="font-display text-2xl font-semibold tracking-tight text-paper-900">
        Performances
      </h2>
      <ul class="mt-4 border-t-2 border-paper-900">
        <li
          v-for="(p, i) in concert.performances"
          :key="i"
          class="flex flex-wrap items-center justify-between gap-4 border-b border-paper-200 py-5"
        >
          <div>
            <p class="text-lg font-semibold text-paper-900">{{ longDate(p.date) }} · {{ timeOf(p.date) }}</p>
            <p class="text-base text-paper-600">{{ p.venue }}</p>
          </div>
          <TicketButton :url="p.ticketUrl" :provider="p.ticketProvider" size="lg" />
        </li>
      </ul>
    </section>

    <!-- Performers -->
    <section
      v-if="concert.conductor || concert.artists?.length"
      aria-label="Performers"
      class="mt-10 max-w-reading space-y-1 text-lg text-paper-800"
    >
      <p v-if="concert.conductor">
        <span class="font-semibold">Conductor</span> · {{ concert.conductor }}
      </p>
      <p v-for="artist in concert.artists" :key="artist.name">
        <span class="font-semibold">{{ artist.role }}</span> · {{ artist.name }}
      </p>
    </section>

    <!-- Programme body -->
    <div class="prose mt-10 max-w-reading">
      <ContentRenderer :value="concert" />
    </div>

    <!-- Repeat CTA for single-date concerts -->
    <div v-if="!isTouring" class="mt-10 border-t border-paper-300 pt-8 max-w-reading">
      <TicketButton :url="concert.ticketUrl" :provider="concert.ticketProvider" size="lg" />
    </div>

    <!-- More in series -->
    <section v-if="moreInSeries.length" :aria-label="`More in ${concert.series}`" class="mt-14">
      <h2 class="font-display text-2xl font-semibold tracking-tight text-paper-900">
        More in {{ concert.series }}
      </h2>
      <div class="mt-5 grid gap-4 sm:grid-cols-3">
        <NuxtLink
          v-for="c in moreInSeries"
          :key="c.path"
          :to="c.path"
          class="flex gap-3 border border-paper-300 p-4 no-underline transition-colors hover:border-paper-900"
        >
          <NuxtImg
            :src="c.image"
            alt=""
            width="64"
            height="64"
            sizes="64px"
            loading="lazy"
            class="aspect-square w-16 shrink-0 border border-paper-300 object-cover"
          />
          <div>
            <span class="block font-display text-lg font-semibold leading-tight text-paper-900">{{ c.title }}</span>
            <span class="mt-1 block text-sm text-paper-600">{{ longDate(c.date) }}</span>
          </div>
        </NuxtLink>
      </div>
    </section>
  </article>
</template>
