<script setup lang="ts">
const DONATION_FRAME_TITLE = 'Donation form (Canada Helps)'

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
    // Canada Helps names its own frame `title="iframe"`, which is what a screen
    // reader announces on entering it. Rename it as soon as it exists; the
    // element is in our document, only its content is cross-origin.
    if (iframe && iframe.title !== DONATION_FRAME_TITLE) {
      iframe.title = DONATION_FRAME_TITLE
    }
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
  <!-- Reserve the height on the container itself (not the placeholder, which
       disappears once loaded) so the form has room to render into and the
       content below never jumps. -->
  <div
    ref="embedContainer"
    class="not-prose relative my-8 min-h-[42rem] w-full max-w-md"
    :class="{ 'border border-paper-300': !loaded }"
    aria-label="Canada Helps donation form"
  >
    <p
      v-if="!loaded"
      class="absolute inset-0 flex items-center justify-center px-6 text-center text-base text-paper-500"
    >
      Loading the secure donation form…
    </p>
  </div>
</template>
