<script setup lang="ts">
const { data: page } = await useAsyncData('about-page', () =>
  queryCollection('pages').path('/about').first()
)

useSeoMeta({
  title: () => page.value?.title ?? 'About',
  description: () => page.value?.description,
  ogTitle: () => page.value?.title ?? 'About',
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
