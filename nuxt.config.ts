// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },

  modules: [
    "@nuxt/ui",
    "@netlify/nuxt",
    "@nuxtjs/google-fonts",
    "@nuxtjs/plausible",
    "@nuxtjs/robots",
    "nuxt-studio",
    "@nuxt/content",
  ],

  css: ["~/assets/css/main.css"],

  // Light-only paper palette; never invert under a dark system preference.
  colorMode: {
    preference: "light",
    fallback: "light",
  },

  app: {
    head: {
      link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
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
