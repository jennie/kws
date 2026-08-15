<script setup lang="ts">
// Intro copy and the coordinator contact block live in content/community.md so
// the client edits them in Studio. The file may not exist yet (copy lands with
// the Aug 14 drop); the page renders its events list either way. The two
// collections are unrelated, so fetch them concurrently rather than letting the
// intro query gate the events query.
const [{ data: page }, { data: events }] = await Promise.all([
  useAsyncData('community-page', () =>
    queryCollection('pages').path('/community').first()
  ),
  useAsyncData('lce-events', () =>
    queryCollection('lceEvents').order('date', 'ASC').all()
  )
])

// Display cap on the archive only. Upcoming is uncapped by design: the LCE
// programme runs roughly 50 events a year and the client wants all of them.
const ARCHIVE_LIMIT = 12

// `splitLceEvents` owns the upcoming/past boundary and the chronological order,
// shared with the homepage module. The archive only ever shows its tail, so
// slice before reversing: the past list grows every season and reversing all of
// it to keep 12 is wasted work.
const listings = computed(() => {
  const { upcoming, past } = splitLceEvents(events.value ?? [])
  return { upcoming, past: past.slice(-ARCHIVE_LIMIT).reverse() }
})

useSeoMeta({
  title: () => page.value?.title ?? 'Learning & community engagement',
  description: () =>
    page.value?.description ??
    'Learning and community engagement events from the Kitchener-Waterloo Symphony.',
  ogTitle: () => page.value?.title ?? 'Learning & community engagement',
  ogDescription: () =>
    page.value?.description ??
    'Learning and community engagement events from the Kitchener-Waterloo Symphony.'
})
</script>

<template>
  <div class="mx-auto max-w-shell px-6 py-12 lg:px-10">
    <header class="max-w-reading">
      <h1 class="font-display text-3xl font-bold tracking-tight text-paper-900 sm:text-4xl">
        Learning &amp; community engagement
      </h1>
    </header>

    <article
      v-if="page"
      class="prose dark:prose-invert mt-6 max-w-reading [&_h2]:text-2xl sm:[&_h2]:text-3xl"
    >
      <ContentRenderer :value="page" />
    </article>

    <section aria-labelledby="upcoming-events" class="mt-12 max-w-4xl lg:mt-16">
      <h2
        id="upcoming-events"
        class="mb-8 border-b-2 border-paper-900 pb-3 font-display text-2xl font-semibold tracking-tight text-paper-900 lg:text-3xl"
      >
        Upcoming events
      </h2>

      <ul v-if="listings.upcoming.length" class="space-y-10">
        <li
          v-for="event in listings.upcoming"
          :key="event.id"
          class="flex flex-col gap-6 border-t border-paper-300 pt-10 first:border-t-0 first:pt-0 sm:flex-row"
        >
          <figure v-if="event.image" class="shrink-0 sm:w-[400px]">
            <NuxtImg
              :src="event.image"
              :alt="event.title"
              width="800"
              height="533"
              sizes="100vw sm:400px"
              loading="lazy"
              format="webp"
              quality="80"
              class="w-full border border-paper-300 object-cover"
            />
            <figcaption
              v-if="event.imageCredit"
              class="mt-2 text-base text-paper-600"
            >
              {{ imageCaption(event.imageCredit) }}
            </figcaption>
          </figure>

          <div class="min-w-0 flex-1">
            <p class="text-base font-medium text-paper-600">
              {{ longDate(eventDateTime(event))
              }}<span v-if="event.time"> · {{ timeOf(eventDateTime(event)) }}</span>
            </p>
            <h3
              class="mt-2 font-display text-xl font-semibold tracking-tight text-paper-900 lg:text-2xl"
            >
              {{ event.title }}
            </h3>
            <p class="mt-2 text-base text-paper-800">{{ event.location }}</p>
            <p v-if="event.description" class="mt-3 text-lg leading-relaxed text-paper-700">
              {{ event.description }}
            </p>
            <a
              v-if="event.linkUrl"
              :href="event.linkUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="mt-5 inline-flex min-h-12 items-center justify-center border-2 border-paper-900 px-5 py-2.5 text-base font-semibold text-paper-900 no-underline transition-colors hover:bg-paper-900 hover:text-paper-50"
            >
              More about this event<span class="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </li>
      </ul>

      <p v-else class="text-lg text-paper-700">
        New events are announced through the season.
      </p>
    </section>

    <section
      v-if="listings.past.length"
      aria-labelledby="past-events"
      class="mt-14 max-w-4xl lg:mt-20"
    >
      <h2
        id="past-events"
        class="mb-6 border-b border-paper-300 pb-3 font-display text-xl font-semibold tracking-tight text-paper-800 lg:text-2xl"
      >
        Past events
      </h2>

      <ul class="space-y-6">
        <li
          v-for="event in listings.past"
          :key="event.id"
          class="border-t border-paper-200 pt-6 first:border-t-0 first:pt-0"
        >
          <p class="text-base text-paper-600">{{ longDate(eventDateTime(event)) }}</p>
          <h3 class="mt-1 font-display text-lg font-semibold tracking-tight text-paper-900">
            {{ event.title }}
          </h3>
          <p class="mt-1 text-base text-paper-700">{{ event.location }}</p>
          <a
            v-if="event.linkUrl"
            :href="event.linkUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-2 inline-block text-base font-medium text-paper-900 hover:underline"
          >
            More about this event<span class="sr-only"> (opens in a new tab)</span>
          </a>
        </li>
      </ul>
    </section>
  </div>
</template>
