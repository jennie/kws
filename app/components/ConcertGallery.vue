<script setup lang="ts">
const props = defineProps<{
  images: { src: string; description?: string; credit?: string }[]
}>()

// Cap-ready: bound this list and fill the show-more position below. No cap in phase 2.
const visibleImages = computed(() =>
  props.images.map((img) => ({
    src: img.src,
    alt: img.description ?? '',
    caption: imageCaption(img.credit)
  }))
)
</script>

<template>
  <section
    v-if="visibleImages.length"
    aria-label="Event photos"
    class="mt-12 max-w-4xl border-t border-paper-200 pt-10"
  >
    <!--
      Height-bounded, not width-bounded. Most artist photos are portraits at
      1600px tall; at full column width one of them ran 1509px, taller than the
      viewport, and buried the ticket CTA. Capping the height instead lets
      portraits and landscapes carry comparable weight and sit side by side,
      and keeps the settled no-crop rule for galleries: max-height plus
      max-width with auto sizing scales to fit both bounds, so nothing is
      cropped and nothing is letterboxed.
    -->
    <ul class="grid items-start gap-x-6 gap-y-10 sm:grid-cols-2">
      <li v-for="img in visibleImages" :key="img.src" class="min-w-0">
        <figure>
          <NuxtImg
            :src="img.src"
            :alt="img.alt"
            width="1600"
            sizes="md:100vw lg:492px"
            loading="lazy"
            format="webp"
            quality="80"
            class="block h-auto max-h-[22rem] w-auto max-w-full border border-paper-300 sm:max-h-[26rem]"
          />
          <figcaption v-if="img.caption" class="mt-2 max-w-reading text-sm text-paper-600">
            {{ img.caption }}
          </figcaption>
        </figure>
      </li>
    </ul>
    <!-- show-more button sits here when a cap ships -->
  </section>
</template>
