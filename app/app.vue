<script setup lang="ts">
const route = useRoute()

// Append the brand to every page title except the home page (whose title is
// already the brand), and emit a canonical link for the current path.
useHead({
  titleTemplate: (title) =>
    title && title.includes("Kitchener-Waterloo Symphony")
      ? title
      : `${title} · Kitchener-Waterloo Symphony`,
  link: [{ rel: "canonical", href: () => absUrl(route.path) }],
})

// Open Graph / Twitter defaults. Pages override ogTitle, ogDescription, and (on
// concert pages) ogImage; everything else falls back to the brand card.
useSeoMeta({
  ogSiteName: "Kitchener-Waterloo Symphony",
  ogType: "website",
  ogLocale: "en_CA",
  ogImage: absUrl("/images/og-default.png"),
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: "Kitchener-Waterloo Symphony",
  twitterCard: "summary_large_image",
})
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
