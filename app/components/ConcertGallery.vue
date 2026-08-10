<script setup lang="ts">
const props = defineProps<{
  images: { src: string; description?: string; credit?: string }[]
}>()

// Cap-ready: bound this list and fill the show-more position below. No cap in phase 2.
const visibleImages = computed(() =>
  props.images.map((img) => ({ src: img.src, caption: imageCaption(img) }))
)
</script>

<template>
  <section v-if="visibleImages.length" aria-label="Event photos" class="mt-10 max-w-4xl space-y-8">
    <figure v-for="img in visibleImages" :key="img.src">
      <NuxtImg
        :src="img.src"
        alt=""
        width="1600"
        sizes="md:100vw lg:896px"
        loading="lazy"
        format="webp"
        quality="80"
        class="block w-full border border-paper-300"
      />
      <figcaption v-if="img.caption" class="mt-2 text-sm text-paper-600">
        {{ img.caption }}
      </figcaption>
    </figure>
    <!-- show-more button sits here when a cap ships -->
  </section>
</template>
