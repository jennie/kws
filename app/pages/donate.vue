<script setup lang="ts">
useSeoMeta({
  title: 'Donate to the KWS',
  description: 'Support the Kitchener Waterloo Symphony with a tax-deductible donation through Canada Helps.'
})

// The Canada Helps embed (cdf_embed.2.js) injects its donation form immediately
// after its own <script> element. Vue templates don't execute inline scripts, so
// append it to the target container on the client and the form renders inside it.
const embedContainer = ref<HTMLElement | null>(null)
const loaded = ref(false)
let pollTimer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  const script = document.createElement('script')
  script.id = 'ch_cdn_embed'
  script.type = 'text/javascript'
  script.src = 'https://www.canadahelps.org/secure/js/cdf_embed.2.js'
  script.charset = 'utf-8'
  script.setAttribute('data-language', 'en')
  script.setAttribute('data-page-id', '131447')
  script.setAttribute('data-root-url', 'https://www.canadahelps.org')
  script.setAttribute('data-formtype', '1')
  script.setAttribute('data-cfasync', 'false')
  embedContainer.value?.appendChild(script)

  // The embed injects an iframe-resizer iframe that starts at height 0 and is
  // sized later via postMessage. Keep the placeholder until that iframe actually
  // has height, so the loading message doesn't vanish before the form paints
  // (the script's own onload fires too early). Fall back after a few seconds so
  // the placeholder can never stick if the resize handshake is slow.
  const startedAt = performance.now()
  pollTimer = setInterval(() => {
    const iframe = embedContainer.value?.querySelector('iframe')
    const hasForm = !!iframe && iframe.getBoundingClientRect().height > 0
    if (hasForm || performance.now() - startedAt > 8000) {
      loaded.value = true
      clearInterval(pollTimer)
    }
  }, 200)
})

onBeforeUnmount(() => clearInterval(pollTimer))
</script>

<template>
  <div class="mx-auto max-w-shell px-6 py-12 lg:px-10">
    <header class="max-w-reading space-y-3">
      <h1 class="font-display text-3xl font-bold tracking-tight text-paper-900 sm:text-4xl">Donate</h1>
      <p class="text-lg leading-relaxed text-paper-700">
        Your support keeps live orchestral music thriving in the Waterloo Region.
        Donations are processed securely through Canada Helps and are eligible for
        a charitable tax receipt.
      </p>
    </header>

    <!-- Reserve the height on the container itself (not the placeholder, which
         disappears once loaded) so the form has room to render into and the
         content below never jumps. -->
    <div
      ref="embedContainer"
      class="relative mt-8 min-h-[42rem] w-full max-w-md border border-paper-300"
      aria-label="Canada Helps donation form"
    >
      <p
        v-if="!loaded"
        class="absolute inset-0 flex items-center justify-center px-6 text-center text-base text-paper-500"
      >
        Loading the secure donation form…
      </p>
    </div>

    <section class="mt-8 max-w-reading space-y-2 text-base text-paper-700">
      <p>
        For information about planned giving, corporate sponsorship, or to make a
        donation by phone or cheque, please see our
        <NuxtLink to="/contact" class="underline">contact page</NuxtLink>.
      </p>
      <p>Charitable registration number: 122524713 RR0001</p>
    </section>
  </div>
</template>
