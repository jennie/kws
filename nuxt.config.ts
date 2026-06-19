// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },

  modules: [
    "@nuxt/ui",
    "@netlify/nuxt",
    "@nuxtjs/google-fonts",
    "@nuxtjs/robots",
    "nuxt-studio",
    "@nuxt/content",
  ],

  css: ["~/assets/css/main.css"],

  // Redirects for legacy kwsymphony.com URLs.
  routeRules: {
    "/allconcerts": { redirect: { to: "/", statusCode: 301 } },
    "/jobs": { redirect: { to: "/about/jobs", statusCode: 301 } },
    "/apply": { redirect: { to: "/about/jobs", statusCode: 301 } },
  },

  // Light-only paper palette; never invert under a dark system preference.
  colorMode: {
    preference: "light",
    fallback: "light",
  },

  app: {
    head: {
      link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
      // Privacy-friendly analytics by Plausible
      script: [
        { src: "https://plausible.io/js/pa-doXDrDsuK2WHd80WGXTIr.js", async: true },
        {
          innerHTML:
            "window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()",
        },
      ],
    },
  },

  googleFonts: {
    display: "swap",
    preload: true,
    families: {
      Archivo: [400, 500, 600, 700],
    },
  },

  ui: {
    theme: {
      colors: ["primary", "secondary", "success", "info", "warning", "error", "neutral"],
    },
  },

  // nuxt-studio detects the repo from CI env vars (e.g. Netlify) at deploy time;
  // set it explicitly so local production builds also resolve a repository.
  studio: {
    repository: {
      provider: "github",
      owner: "jennie",
      repo: "kws",
      branch: "main",
    },
  },
});
