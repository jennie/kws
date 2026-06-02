<script setup lang="ts">
const { data: page } = await useAsyncData('contact-page', () =>
  queryCollection('pages').path('/contact').first()
)

useSeoMeta({
  title: () => page.value?.title ?? 'Contact',
  description: () => page.value?.description
})
</script>

<template>
  <UContainer class="py-12 max-w-3xl">
    <article v-if="page" class="prose dark:prose-invert max-w-none">
      <ContentRenderer :value="page" />
    </article>
    <p v-else>Page not found.</p>
  </UContainer>
</template>
