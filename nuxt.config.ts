// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },

  modules: [
    "@nuxt/ui",
    "@nuxt/image",
    "@netlify/nuxt",
    "@nuxtjs/google-fonts",
    "@nuxtjs/robots",
    "nuxt-studio",
    "@nuxt/content",
  ],

  css: ["~/assets/css/main.css"],

  // Content is fully static (markdown, rebuilt on Studio edit), so prerender
  // every page to static HTML served from Netlify's CDN instead of rendering
  // on-demand in a function. crawlLinks follows the concert/nav/footer links
  // out from "/" to reach every route.
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ["/"],
    },
  },

  // Provider is auto-detected: IPX in local dev (sharp is available), and the
  // Netlify Image CDN on deploy. Don't hard-set "netlify" or local `nuxt dev`
  // can't transform images.
  image: {},

  // Redirects for legacy kwsymphony.com URLs.
  routeRules: {
    "/allconcerts": { redirect: { to: "/", statusCode: 301 } },
    "/jobs": { redirect: { to: "/about/jobs", statusCode: 301 } },
    "/apply": { redirect: { to: "/about/jobs", statusCode: 301 } },
  },

  app: {
    head: {
      htmlAttrs: { lang: "en" },
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

  // Light-only paper palette. Disabling color mode hard-locks the site to
  // light: the `.dark` class is never applied, so Nuxt UI's dark tokens can't
  // surface (e.g. white prose headings) under a system preference or a stored
  // color-mode cookie.
  ui: {
    colorMode: false,
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
