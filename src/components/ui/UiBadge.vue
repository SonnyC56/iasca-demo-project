<script setup lang="ts">
withDefaults(defineProps<{ tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'brand' }>(), {
  tone: 'neutral',
})

const tones = {
  neutral: 'bg-surface-2 text-ink-muted',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/20 text-ink',
  danger: 'bg-danger/15 text-danger',
  brand: 'bg-brand-soft text-brand',
} as const
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
    :class="tones[tone]"
  >
    <slot />
  </span>
</template>
