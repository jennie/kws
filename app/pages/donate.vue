<script setup lang="ts">
useSeoMeta({
  title: 'Donate to the KWS',
  description: 'Support the Kitchener Waterloo Symphony with a tax-deductible donation through Canada Helps.'
})
</script>

<template>
  <UContainer class="py-12 max-w-3xl space-y-8">
    <header class="space-y-3">
      <h1 class="text-4xl font-bold">Donate</h1>
      <p class="text-lg opacity-80">
        Your support keeps live orchestral music thriving in the Waterloo Region.
        Donations are processed securely through Canada Helps and are eligible for
        a charitable tax receipt.
      </p>
    </header>

    <!--
      Canada Helps embed placeholder.
      Replace the contents of this block with the real Canada Helps iframe / script
      provided by the donation platform.
    -->
    <div
      class="border-2 border-dashed rounded-lg p-12 text-center"
      aria-label="Canada Helps donation form placeholder"
    >
      <p class="font-semibold mb-2">Canada Helps embed goes here</p>
      <p class="text-sm opacity-70">
        Replace this block with the embed code from the KWS Canada Helps account.
      </p>
    </div>

    <section class="space-y-2 text-sm opacity-80">
      <p>
        For information about planned giving, corporate sponsorship, or to make a
        donation by phone or cheque, please see our
        <NuxtLink to="/contact" class="underline">contact page</NuxtLink>.
      </p>
      <p>Charitable registration number: 000000000-RR0000 (placeholder)</p>
    </section>
  </UContainer>
</template>
