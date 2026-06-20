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
    "@nuxtjs/sitemap",
    "nuxt-studio",
    "@nuxt/content",
  ],

  css: ["~/assets/css/main.css"],

  // Canonical production host. Drives sitemap URLs, canonical links, and the
  // Sitemap: line added to robots.txt. This is the cutover target domain, not
  // the interim netlify.app host (see app/utils/seo.ts).
  site: {
    url: "https://www.kwsymphony.com",
    name: "Kitchener-Waterloo Symphony",
  },

  // Content is fully static (markdown, rebuilt on Studio edit), so prerender
  // every page to static HTML served from Netlify's CDN instead of rendering
  // on-demand in a function. crawlLinks follows the concert/nav/footer links
  // out from "/" to reach every route.
  nitro: {
    prerender: {
      crawlLinks: true,
      // robots.txt isn't reachable by link-crawling, so name it explicitly to
      // emit it as a static file (with the Sitemap: line the sitemap module
      // injects) rather than leaving it to a request-time function.
      routes: ["/", "/robots.txt"],
      // Don't prerender image-transform URLs the crawler finds in <img>/srcset.
      // They're served at request time by the Netlify Image CDN (or IPX in dev),
      // and 404 at build time, which would otherwise fail the prerender.
      ignore: ["/.netlify/images", "/_ipx"],
    },
  },

  // Provider is auto-detected: IPX in local dev (sharp is available), and the
  // Netlify Image CDN on deploy. Don't hard-set "netlify" or local `nuxt dev`
  // can't transform images.
  image: {},

  // 301 redirects from the old kwsymphony.com (Squarespace) URL structure to
  // the new one, so search ranking and inbound links survive the domain
  // cutover. Source paths are every URL in the old site's sitemap.xml. Nitro
  // matches most-specific first, so the per-concert rules win over the
  // /allconcerts/** catch-all.
  routeRules: {
    // Top-level pages.
    "/home": { redirect: { to: "/", statusCode: 301 } },
    "/allconcerts": { redirect: { to: "/", statusCode: 301 } },
    "/news": { redirect: { to: "/", statusCode: 301 } },
    "/update": { redirect: { to: "/", statusCode: 301 } },
    "/gemmell-video": { redirect: { to: "/", statusCode: 301 } },
    // Concert slugs that carried into the new season.
    "/allconcerts/beauty-power": { redirect: { to: "/concerts/beauty-and-power", statusCode: 301 } },
    "/allconcerts/folk-dances": { redirect: { to: "/concerts/folk-dances", statusCode: 301 } },
    "/allconcerts/yuletide-pops": { redirect: { to: "/concerts/yuletide-pops", statusCode: 301 } },
    "/allconcerts/solace": { redirect: { to: "/concerts/solace", statusCode: 301 } },
    "/allconcerts/the-journey-home": { redirect: { to: "/concerts/the-journey-home", statusCode: 301 } },
    // Every other (past-season) concert page → the concert listing.
    "/allconcerts/**": { redirect: { to: "/", statusCode: 301 } },
    // About-section content that no longer has its own page.
    "/our-musicians": { redirect: { to: "/about", statusCode: 301 } },
    "/board-of-directors-and-staff": { redirect: { to: "/about", statusCode: 301 } },
    "/kws-in-the-community": { redirect: { to: "/about", statusCode: 301 } },
    "/orchestral-musician-school-visits": { redirect: { to: "/about", statusCode: 301 } },
    "/mnbios": { redirect: { to: "/about", statusCode: 301 } },
    "/artist-bios": { redirect: { to: "/about", statusCode: 301 } },
    // Jobs/apply (old /jobs is in the legacy sitemap; /apply is a known alias).
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
