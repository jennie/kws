<script setup lang="ts">
const { data: jobs } = await useAsyncData('jobs-page', () =>
  queryCollection('jobs').path('/about/jobs').first()
)

const hasOpenings = computed(() => (jobs.value?.body?.value?.length ?? 0) > 0)
const message = computed(() =>
  hasOpenings.value ? jobs.value?.aboutOpen : jobs.value?.aboutEmpty
)
</script>

<template>
  <MDC v-if="message" :value="message" />
</template>
