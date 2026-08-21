<script setup lang="ts">
// Coarse lower bound on the LCE query: the module shows three events, and
// without it the homepage payload carries every event ever entered, a list that
// only grows. A day of slack absorbs the gap between the build container's
// clock and local time; the exact boundary is applied in `lceUpcoming` below.
const lceSince = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

// The two collections are unrelated, so fetch them concurrently rather than
// letting the concert query gate the LCE one.
const [{ data: concerts }, { data: lceEvents }] = await Promise.all([
  useAsyncData("concerts-upcoming", () =>
    queryCollection("concerts").order("date", "ASC").all(),
  ),
  useAsyncData("lce-upcoming", () =>
    queryCollection("lceEvents").where("date", ">=", lceSince).all(),
  ),
]);

const upcoming = computed(() => {
  const now = Date.now();
  return (concerts.value ?? []).filter((c) => {
    const t = new Date(c.date).getTime();
    return !Number.isNaN(t) && t >= now;
  });
});

// Three, per the signed SOW. Shows fewer if fewer exist; the section hides
// entirely at zero.
const LCE_MODULE_LIMIT = 3;
const lceUpcoming = computed(() =>
  splitLceEvents(lceEvents.value ?? []).upcoming.slice(0, LCE_MODULE_LIMIT),
);

const next = computed(() => upcoming.value[0]);
const nextPath = computed(() => next.value?.path);
const nextImage = computed(() => heroImage(next.value));

const performanceCount = computed(() =>
  upcoming.value.reduce((sum, c) => sum + (c.performances?.length ?? 1), 0),
);

const SERIES_ORDER = ["Masterworks", "Pops", "Baroque & Beyond", "Family"];
const NUMBER_WORDS = [
  "Zero",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
];
const numberWord = (n: number) => NUMBER_WORDS[n] ?? String(n);

const seriesId = (series: string) =>
  "series-" +
  series
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function groupLabel(list: { performances?: unknown[] }[]) {
  const allTouring =
    list.length > 0 && list.every((c) => (c.performances?.length ?? 0) > 0);
  const noun = allTouring ? "touring programme" : "concert";
  return `${numberWord(list.length)} ${noun}${list.length === 1 ? "" : "s"}`;
}

const grouped = computed(() => {
  const bySeries = new Map<string, typeof upcoming.value>();
  for (const concert of upcoming.value) {
    // The next concert leads the page; don't repeat it in its series group.
    if (concert.path === nextPath.value) continue;
    const key = concert.series ?? "Other";
    if (!bySeries.has(key)) bySeries.set(key, []);
    bySeries.get(key)!.push(concert);
  }

  const ordered: {
    series: string;
    id: string;
    label: string;
    concerts: typeof upcoming.value;
  }[] = [];
  const take = (series: string, list: typeof upcoming.value) => {
    ordered.push({
      series,
      id: seriesId(series),
      label: groupLabel(list),
      concerts: list,
    });
  };
  for (const series of SERIES_ORDER) {
    const list = bySeries.get(series);
    if (list) {
      take(series, list);
      bySeries.delete(series);
    }
  }
  for (const [series, list] of bySeries) take(series, list);
  return ordered;
});

// Lead "next concert" feature.
const leadVenue = computed(() => splitVenue(next.value?.venue));

useSeoMeta({
  title: "Kitchener-Waterloo Symphony",
  description:
    "Concerts and events from the Kitchener-Waterloo Symphony, serving the Waterloo Region for 75 years.",
  ogTitle: "Kitchener-Waterloo Symphony",
  ogDescription:
    "Concerts and events from the Kitchener-Waterloo Symphony, serving the Waterloo Region for 75 years.",
});

// Organisation structured data for the knowledge panel.
useHead({
  script: [
    { type: "application/ld+json", innerHTML: ldJson(organisationJsonLd()) },
  ],
});

// Scroll-spy: ink the jump-nav link for the series currently in view.
const activeSeriesId = ref("");
onMounted(() => {
  const sections = Array.from(
    document.querySelectorAll<HTMLElement>("[data-jump-target]"),
  );
  if (sections.length < 2) return;
  const intersecting = new Set<string>();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) intersecting.add(e.target.id);
        else intersecting.delete(e.target.id);
      }
      let topId = "";
      let topY = Infinity;
      for (const s of sections) {
        if (!intersecting.has(s.id)) continue;
        const y = s.getBoundingClientRect().top;
        if (y < topY) {
          topY = y;
          topId = s.id;
        }
      }
      if (topId) activeSeriesId.value = topId;
    },
    { rootMargin: "-72px 0px -60% 0px" },
  );
  sections.forEach((s) => observer.observe(s));
  onBeforeUnmount(() => observer.disconnect());
});
</script>

<template>
  <div class="bg-paper-50">
    <div v-if="upcoming.length" class="mx-auto max-w-shell px-6 lg:px-10">
      <div
        class="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pt-10 pb-6 lg:pt-14"
      >
        <h1
          class="font-display text-3xl font-bold tracking-tight text-paper-900 lg:text-[3.25rem] lg:leading-none"
        >
          Concerts &amp; events
        </h1>
        <p class="text-base text-paper-600">
          <span class="font-semibold text-paper-900"
            >{{ performanceCount }} performances</span
          >
          across the 2026/27 season
        </p>
      </div>

      <!-- Lead: next concert -->
      <section
        v-if="next"
        aria-labelledby="lead-title"
        class="mb-10 grid border border-paper-900 lg:grid-cols-[1.1fr_1fr]"
      >
        <NuxtLink
          :to="nextPath"
          :aria-label="next.title"
          class="block aspect-video border-b border-paper-900 no-underline lg:aspect-auto lg:border-b-0 lg:border-r"
        >
          <NuxtImg
            v-if="nextImage"
            :src="nextImage.src"
            :alt="nextImage.description || next.title"
            width="1600"
            height="900"
            sizes="md:100vw lg:55vw"
            fit="cover"
            :modifiers="{ position: 'top' }"
            fetchpriority="high"
            class="h-full w-full object-cover"
          />
        </NuxtLink>
        <div class="flex flex-col justify-center p-8 lg:p-10">
          <div class="mb-4 flex items-baseline justify-between gap-4">
            <span
              v-if="next.series"
              class="text-base font-medium text-paper-600"
              >{{ next.series }}</span
            >
            <span class="kws-eyebrow kws-eyebrow--ink">Next concert</span>
          </div>
          <h2
            id="lead-title"
            class="mb-4 font-display text-3xl font-bold leading-[1.02] tracking-tight text-paper-900 lg:text-[3rem]"
          >
            <NuxtLink :to="nextPath" class="no-underline hover:underline">{{
              next.title
            }}</NuxtLink>
          </h2>
          <p
            v-if="next.description"
            class="mb-6 max-w-[46ch] text-lg text-paper-600"
          >
            {{ next.description }}
          </p>
          <dl class="mb-7">
            <dt class="sr-only">Date and time</dt>
            <dd class="text-base text-paper-800">
              {{ longDate(next.date) }} · {{ timeOf(next.date) }}
            </dd>
            <dt class="sr-only">Venue</dt>
            <dd class="mt-3 text-base text-paper-800">
              {{ leadVenue.name }}<br v-if="leadVenue.city" /><span
                v-if="leadVenue.city"
                class="text-paper-600"
                >{{ leadVenue.city }}</span
              >
            </dd>
          </dl>
          <div>
            <TicketButton
              :url="next.ticketUrl"
              :provider="next.ticketProvider"
              size="lg"
            />
          </div>
        </div>
      </section>

      <!-- Sticky series jump-nav -->
      <nav
        v-if="grouped.length > 1"
        aria-label="Jump to series"
        class="sticky top-0 z-20 -mx-6 mb-10 border-y border-paper-300 bg-paper-50 px-6 py-3 lg:-mx-10 lg:px-10"
      >
        <ul class="flex flex-wrap gap-x-6 gap-y-2">
          <li v-for="group in grouped" :key="group.id">
            <a
              :href="`#${group.id}`"
              :aria-current="activeSeriesId === group.id ? 'true' : undefined"
              class="inline-block py-1 -my-1 text-base no-underline hover:text-paper-900 hover:underline"
              :class="
                activeSeriesId === group.id
                  ? 'font-semibold text-paper-900'
                  : 'font-medium text-paper-700'
              "
            >
              {{ group.series }}
            </a>
          </li>
        </ul>
      </nav>

      <!-- Series groups -->
      <div class="space-y-12 pb-16 lg:space-y-16">
        <section
          v-for="group in grouped"
          :id="group.id"
          :key="group.series"
          data-jump-target
          class="scroll-mt-20"
        >
          <div
            class="mb-6 flex flex-col gap-1 border-b-2 border-paper-900 pb-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
          >
            <h2
              class="font-display text-2xl font-semibold tracking-tight text-paper-900 lg:text-3xl"
            >
              {{ group.series }}
            </h2>
            <span class="kws-eyebrow sm:whitespace-nowrap">{{
              group.label
            }}</span>
          </div>

          <div class="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            <ConcertCard
              v-for="concert in group.concerts"
              :key="concert.path"
              :title="concert.title"
              :date="concert.date"
              :venue="concert.venue"
              :image="heroImage(concert)?.src"
              :image-alt="heroImage(concert)?.description"
              :slug="concert.path"
              :ticket-url="concert.ticketUrl"
              :ticket-provider="concert.ticketProvider"
              :series="concert.series"
              :conductor="concert.conductor"
              :artists="concert.artists"
              :performances="concert.performances"
              :featured="concert.path === nextPath"
            />
          </div>
        </section>
      </div>
    </div>

    <!-- Empty state: season ended -->
    <div v-else class="mx-auto max-w-shell px-6 lg:px-10">
      <section
        aria-label="No upcoming concerts"
        class="py-20 text-center lg:py-28"
      >
        <h1
          class="mx-auto max-w-2xl font-display text-3xl font-bold leading-[1.15] tracking-tight text-paper-900 lg:text-4xl"
        >
          The next programme is being prepared.
        </h1>
        <p class="mx-auto mt-5 max-w-xl text-lg leading-[1.55] text-paper-700">
          The season concludes shortly. Sign up for season announcements,
          revisit past programmes, or reach the us while we finalize the year
          ahead.
        </p>
        <div class="mt-9 flex flex-wrap items-center justify-center gap-4">
          <NuxtLink
            to="/contact"
            class="inline-flex min-h-13 items-center justify-center border-2 border-paper-900 bg-paper-900 px-7 py-3.5 font-semibold text-paper-50 no-underline transition-colors hover:bg-paper-50 hover:text-paper-900"
          >
            Contact us
          </NuxtLink>
          <NuxtLink
            to="/donate"
            class="inline-flex min-h-13 items-center justify-center border-2 border-paper-900 px-7 py-3.5 font-semibold text-paper-900 no-underline transition-colors hover:bg-paper-900 hover:text-paper-50"
          >
            Support the KWS
          </NuxtLink>
        </div>
      </section>
    </div>

    <!--
      Learning & community engagement. Full-bleed band so it reads as its own
      thing next to the season, distinct through tone and structure rather than
      colour. Sits outside the season conditional above so it survives the
      season-ended empty state. Deliberately not in the "Jump to series" nav.
    -->
    <section
      v-if="lceUpcoming.length"
      aria-labelledby="lce-heading"
      class="border-y border-paper-300 bg-paper-100"
    >
      <div class="mx-auto max-w-shell px-6 py-12 lg:px-10 lg:py-16">
        <div
          class="mb-8 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
        >
          <h2
            id="lce-heading"
            class="font-display text-2xl font-semibold tracking-tight text-paper-900 lg:text-3xl"
          >
            Learning &amp; community engagement
          </h2>
          <NuxtLink
            to="/community"
            class="text-base font-semibold"
          >
            See all community events
          </NuxtLink>
        </div>

        <!--
          Rows carry no link of their own: LCE events are listing-only, so every
          row would point at /community and repeat the link above it.
        -->
        <ul
          class="max-w-4xl divide-y divide-paper-300 border-y border-paper-300"
        >
          <li
            v-for="event in lceUpcoming"
            :key="event.id"
            class="py-5 sm:flex sm:gap-8"
          >
            <p class="text-base font-medium text-paper-600 sm:w-52 sm:shrink-0">
              {{ longDate(eventDateTime(event)) }}
            </p>
            <div class="mt-1 min-w-0 sm:mt-0">
              <h3
                class="font-display text-xl font-semibold tracking-tight text-paper-900"
              >
                {{ event.title }}
              </h3>
              <p class="mt-1 text-base text-paper-800">{{ event.location }}</p>
            </div>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>
