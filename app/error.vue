<script setup lang="ts">
defineProps<{ error: { statusCode?: number } }>()

function goTo(path: string) {
  clearError({ redirect: path })
}
</script>

<template>
  <NuxtLayout name="default">
    <section class="mx-auto max-w-3xl px-6 py-20 text-center lg:py-28">
      <p class="kws-eyebrow">
        Error {{ error?.statusCode || 404 }}
      </p>
      <h1 class="mx-auto mt-3 max-w-2xl font-display text-4xl font-bold leading-[1.1] tracking-tight text-paper-900 lg:text-5xl">
        We couldn't find that page.
      </h1>
      <p class="mx-auto mt-5 max-w-xl text-lg leading-[1.55] text-paper-700">
        The concert or page may have moved, or the season may have ended.
        Browse the current season or reach the box office.
      </p>
      <div class="mt-9 flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          class="inline-flex min-h-[3.25rem] items-center justify-center border-2 border-paper-900 bg-paper-900 px-7 py-3.5 font-semibold text-paper-50 transition-colors hover:bg-paper-50 hover:text-paper-900"
          @click="goTo('/')"
        >
          View all concerts
        </button>
        <button
          type="button"
          class="inline-flex min-h-[3.25rem] items-center justify-center border-2 border-paper-900 px-7 py-3.5 font-semibold text-paper-900 transition-colors hover:bg-paper-900 hover:text-paper-50"
          @click="goTo('/contact')"
        >
          Contact the box office
        </button>
      </div>
    </section>
  </NuxtLayout>
</template>
