<template>
  <section class="rounded-card border border-line bg-surface p-5 shadow-sm">
    <header v-if="$slots.title" class="mb-4 flex items-center justify-between gap-3">
      <h2 class="text-base font-semibold text-ink"><slot name="title" /></h2>
      <slot name="actions" />
    </header>
    <slot />
  </section>
</template>
