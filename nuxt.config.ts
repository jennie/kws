// https://nuxt.com/docs/api/configuration/nuxt-config

// The host the new site is actually served from. Until DNS is repointed,
// www.kwsymphony.com still serves the old Squarespace site, so canonical links,
// the sitemap, and Open Graph image URLs must use the netlify.app subdomain to
// resolve (otherwise social-preview scrapers 404 on the old domain). Not
// derived from Netlify's URL env, which can already be pinned to www.
// AT CUTOVER: set NUXT_SITE_URL=https://www.kwsymphony.com in Netlify and
// redeploy.
const siteUrl = process.env.NUXT_SITE_URL || "https://kwsymphony.netlify.app";

// Only let the real production domain be indexed. The pre-cutover netlify.app
// deploy now self-canonicalises and ships a sitemap, so without this it could
// get indexed and compete with www after launch. @nuxtjs/robots reads this and
// emits Disallow: / + noindex on the staging host; it flips to indexable when
// NUXT_SITE_URL points at www at cutover.
const indexable = siteUrl.includes("www.kwsymphony.com");

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

  // Drives sitemap URLs, canonical links, and the Sitemap: line in robots.txt.
  site: {
    url: siteUrl,
    name: "Kitchener-Waterloo Symphony",
    indexable,
  },

  // Inline the resolved host as a literal (isomorphic, same value on server and
  // client) so seo.ts/schema.ts can build absolute URLs in pure utils, even
  // inside head getter functions where Nuxt composables aren't callable.
  vite: {
    define: { __SITE_URL__: JSON.stringify(siteUrl) },
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
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      ],
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
