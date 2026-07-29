<script setup lang="ts">
const { data: musicians } = await useAsyncData('musicians', () =>
  queryCollection('musicians').all()
)

const sections = computed(() => groupMusicians(musicians.value ?? []))

useSeoMeta({
  title: 'The orchestra',
  description:
    'The musicians of the Kitchener-Waterloo Symphony, by section and instrument.',
  ogTitle: 'The orchestra',
  ogDescription:
    'The musicians of the Kitchener-Waterloo Symphony, by section and instrument.'
})
</script>

<template>
  <div class="mx-auto max-w-shell px-6 py-12 lg:px-10">
    <AboutSubNav />
    <header class="mb-12 max-w-reading">
      <h1 class="font-display text-3xl font-semibold tracking-tight text-paper-900 sm:text-4xl">
        The orchestra
      </h1>
      <p class="mt-4 text-base text-paper-800">
        The musicians of the Kitchener-Waterloo Symphony.
      </p>
    </header>

    <div v-if="sections.length" class="space-y-12 lg:space-y-16">
      <section v-for="group in sections" :key="group.section">
        <h2
          class="mb-8 border-b-2 border-paper-900 pb-3 font-display text-2xl font-semibold tracking-tight text-paper-900 lg:text-3xl"
        >
          {{ group.section }}
        </h2>

        <div class="space-y-10">
          <div v-for="part in group.instruments" :key="part.instrument">
            <h3 class="mb-5 font-display text-lg font-semibold tracking-tight text-paper-900">
              {{ part.instrument }}
            </h3>
            <ul class="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
              <MusicianCard
                v-for="musician in part.musicians"
                :key="musician.name"
                :name="musician.name"
                :chair="musician.chair"
                :photo="musician.photo"
              />
            </ul>
          </div>
        </div>
      </section>
    </div>

    <p v-else class="max-w-reading text-base text-paper-800">
      The roster for this season is being finalized.
    </p>
  </div>
</template>
