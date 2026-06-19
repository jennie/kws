<script setup lang="ts">
const { data: page } = await useAsyncData('jobs-page', () =>
  queryCollection('jobs').path('/about/jobs').first()
)

// The content body holds only the current postings, so an empty body means
// there are no openings right now and we show the empty state instead.
const hasOpenings = computed(() => (page.value?.body?.value?.length ?? 0) > 0)

useSeoMeta({
  title: () => page.value?.title ?? 'Jobs',
  description: () => page.value?.description
})
</script>

<template>
  <div class="mx-auto max-w-shell px-6 py-12 lg:px-10">
    <header class="max-w-reading">
      <h1 class="font-display text-3xl font-bold tracking-tight text-paper-900 sm:text-4xl">Work with the KWS</h1>
    </header>

    <article
      v-if="page && hasOpenings"
      class="prose dark:prose-invert mt-6 max-w-reading [&_h2]:text-2xl sm:[&_h2]:text-3xl"
    >
      <p>{{ page.intro }}</p>
      <ContentRenderer :value="page" />
    </article>

    <div v-else-if="page" class="mt-6 max-w-reading border border-paper-300 p-6">
      <p class="text-lg font-semibold text-paper-900">{{ page.emptyTitle }}</p>
      <div class="prose dark:prose-invert mt-2 text-lg leading-relaxed text-paper-700">
        <MDC :value="page.emptyMessage" />
      </div>
    </div>
  </div>
</template>
