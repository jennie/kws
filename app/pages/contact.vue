<script setup lang="ts">
const { data: page } = await useAsyncData('contact-page', () =>
  queryCollection('pages').path('/contact').first()
)

useSeoMeta({
  title: () => page.value?.title ?? 'Contact',
  description: () => page.value?.description
})

const formRef = ref<HTMLFormElement | null>(null)
const submitted = ref(false)
const showError = ref(false)

async function onSubmit() {
  const form = formRef.value
  if (!form) return
  if (!form.checkValidity()) {
    showError.value = true
    form.reportValidity()
    return
  }
  showError.value = false
  const body = new URLSearchParams(new FormData(form) as unknown as Record<string, string>).toString()
  await fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  })
  submitted.value = true
}

const fieldClass =
  'mt-1 w-full border border-paper-500 bg-paper-50 px-3 py-2.5 text-base text-paper-900 placeholder:text-paper-500'
const labelClass = 'block text-sm font-semibold text-paper-700'
</script>

<template>
  <div class="mx-auto max-w-shell px-6 py-12 lg:px-10">
    <h1 class="font-display text-3xl font-bold tracking-tight text-paper-900 sm:text-4xl">Contact</h1>

    <section aria-labelledby="get-in-touch" class="mt-8 max-w-reading">
      <h2 id="get-in-touch" class="font-display text-2xl font-semibold tracking-tight text-paper-900">
        Get in touch
      </h2>
      <p class="mt-2 text-lg text-paper-700">
        For general inquiries, complete the form below and a member of the KWS team will connect with you.
      </p>

      <div
        v-if="submitted"
        class="mt-6 border-2 border-paper-900 p-5"
        role="status"
      >
        <h3 class="font-display text-xl font-semibold text-paper-900">Thanks, your message is on its way.</h3>
        <p class="mt-1 text-base text-paper-700">
          A member of the KWS team will reply by email. For anything urgent, reach the box office at
          <a href="mailto:info@kwsymphony.com" class="hover:underline">info@kwsymphony.com</a>.
        </p>
      </div>

      <form
        v-else
        ref="formRef"
        name="contact"
        method="post"
        data-netlify="true"
        netlify-honeypot="bot-field"
        novalidate
        class="mt-6 space-y-5"
        @submit.prevent="onSubmit"
      >
        <input type="hidden" name="form-name" value="contact">
        <p class="hidden">
          <label>Don't fill this out: <input name="bot-field"></label>
        </p>

        <div
          v-if="showError"
          class="border-2 border-paper-900 bg-paper-100 p-4"
          role="alert"
        >
          <p class="font-semibold text-paper-900">There's a problem with the form</p>
          <p class="text-base text-paper-700">Check the highlighted fields below and try again.</p>
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <div>
            <label :class="labelClass" for="first-name">First name (required)</label>
            <input id="first-name" name="first-name" type="text" required autocomplete="given-name" :class="fieldClass">
          </div>
          <div>
            <label :class="labelClass" for="last-name">Last name (required)</label>
            <input id="last-name" name="last-name" type="text" required autocomplete="family-name" :class="fieldClass">
          </div>
        </div>

        <div>
          <label :class="labelClass" for="email">Email (required)</label>
          <input id="email" name="email" type="email" required autocomplete="email" :class="fieldClass">
        </div>

        <div>
          <label :class="labelClass" for="subject">Subject (required)</label>
          <input id="subject" name="subject" type="text" required :class="fieldClass">
        </div>

        <div>
          <label :class="labelClass" for="message">Message (required)</label>
          <textarea id="message" name="message" rows="6" required :class="fieldClass" />
        </div>

        <button
          type="submit"
          class="inline-flex min-h-[3.25rem] items-center justify-center border-2 border-paper-900 bg-paper-900 px-7 py-3.5 font-semibold text-paper-50 transition-colors hover:bg-paper-50 hover:text-paper-900"
        >
          Submit
        </button>
      </form>
    </section>

    <article v-if="page" class="prose mt-12 max-w-reading">
      <ContentRenderer :value="page" />
    </article>
  </div>
</template>
