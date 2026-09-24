<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Moon, Sun } from '@lucide/vue'
import { useTheme } from '@/composables/useTheme'
import { UiButton } from '@/components/ui'

const mode = useTheme()
function toggleTheme() {
  mode.value = mode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <header
      class="sticky top-0 z-10 border-b border-line bg-surface/85 backdrop-blur pt-[env(safe-area-inset-top)]"
    >
      <div class="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <RouterLink to="/" class="flex items-center gap-2 font-semibold tracking-tight">
          <span
            class="grid size-8 place-items-center rounded-lg bg-brand text-sm font-bold text-brand-ink"
            >IA</span
          >
          <span>IASCA CRM</span>
        </RouterLink>
        <UiButton
          variant="ghost"
          size="sm"
          :aria-label="mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleTheme"
        >
          <Sun v-if="mode === 'dark'" class="size-4" />
          <Moon v-else class="size-4" />
        </UiButton>
      </div>
    </header>

    <main
      class="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
    >
      <RouterView />
    </main>
  </div>
</template>
