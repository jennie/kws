<script setup lang="ts">
const { data: page } = await useAsyncData('donate-page', () =>
  queryCollection('pages').path('/donate').first()
)

useSeoMeta({
  title: () => page.value?.title ?? 'Donate',
  description: () => page.value?.description,
  ogTitle: () => page.value?.title ?? 'Donate',
  ogDescription: () => page.value?.description
})
</script>

<template>
  <div class="mx-auto max-w-shell px-6 py-12 lg:px-10">
    <article v-if="page" class="prose dark:prose-invert max-w-reading [&_h1]:text-3xl sm:[&_h1]:text-4xl">
      <ContentRenderer :value="page" />
    </article>
    <p v-else>Page not found.</p>
  </div>
</template>
