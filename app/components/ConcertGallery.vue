<script setup lang="ts">
const props = defineProps<{
  images: { src: string; description?: string; credit?: string }[]
}>()

// Cap-ready: bound this list and fill the show-more position below. No cap in phase 2.
const visibleImages = computed(() =>
  props.images.map((img) => {
    const description = img.description?.trim()
    return {
      src: img.src,
      // The description is rendered visibly in the figcaption below, so the
      // image is decorative to assistive tech. Leaving it in alt as well makes
      // a screen reader announce the same sentence twice for one photograph.
      alt: '',
      description,
      credit: imageCaption(img.credit)
    }
  })
)
</script>

<template>
  <section
    v-if="visibleImages.length"
    aria-label="Event photos"
    class="mt-12 max-w-4xl border-t border-paper-200 pt-10"
  >
    <!--
      One 3:2 crop for every gallery image, aimed at the subject rather than
      the centre of the frame. This replaces the earlier no-crop rule, which
      was chosen so group shots would not lose people: uncropped mixed
      orientations gave every row a different shape, and the images that came
      in as tall portraits dominated the page. 3:2 matches the concert card
      and the related-concert card, so the page carries one image shape below
      the 16:9 hero, and `position: attention` keeps faces in frame where a
      centre crop would cut them off.
    -->
    <ul class="grid gap-x-6 gap-y-10 sm:grid-cols-2">
      <li v-for="img in visibleImages" :key="img.src" class="min-w-0">
        <figure>
          <NuxtImg
            :src="img.src"
            :alt="img.alt"
            width="984"
            height="656"
            sizes="100vw sm:492px"
            :modifiers="{ position: 'attention' }"
            loading="lazy"
            format="webp"
            quality="80"
            class="block aspect-[3/2] w-full border border-paper-300 object-cover"
          />
          <!-- paper-500 is the lightest step that still clears WCAG AA on
               paper-50 at this size: 4.73:1 against a 4.5 floor. -->
          <figcaption v-if="img.description || img.credit" class="mt-2 max-w-reading text-base">
            <span v-if="img.description" class="block text-paper-600">{{ img.description }}</span>
            <span v-if="img.credit" class="block italic text-paper-500">{{ img.credit }}</span>
          </figcaption>
        </figure>
      </li>
    </ul>
    <!-- show-more button sits here when a cap ships -->
  </section>
</template>
