<script setup lang="ts">
const model = defineModel<string>({ default: '' })
</script>

<template>
  <input
    v-model="model"
    class="h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-muted"
  />
</template>
