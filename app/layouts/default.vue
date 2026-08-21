<template>
  <div class="flex min-h-svh flex-col bg-paper-50 text-paper-800">
    <a href="#main-content" class="kws-skip-link">Skip to main content</a>
    <AppNav />
    <main id="main-content" class="grow">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
