<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { Building2, Handshake, LayoutDashboard, Moon, Sun, Users } from '@lucide/vue'
import { useTheme } from '@/composables/useTheme'
import { UiButton } from '@/components/ui'

const mode = useTheme()
const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/contacts', label: 'Contacts', icon: Users },
  { to: '/companies', label: 'Companies', icon: Building2 },
  { to: '/deals', label: 'Deals', icon: Handshake },
]
</script>

<template>
  <div class="flex min-h-dvh">
    <aside class="hidden w-60 shrink-0 flex-col border-r border-line bg-surface p-4 md:flex">
      <div class="mb-6 flex items-center gap-2 px-2 font-semibold">
        <span
          class="grid size-8 place-items-center rounded-lg bg-brand text-sm font-bold text-brand-ink"
          >IA</span
        >
        IASCA CRM
      </div>
      <nav class="space-y-1">
        <RouterLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-muted hover:bg-surface-2"
          exact-active-class="!bg-brand-soft !text-brand font-medium"
        >
          <component :is="item.icon" class="size-4" /> {{ item.label }}
        </RouterLink>
      </nav>
      <UiButton
        variant="ghost"
        size="sm"
        class="mt-auto"
        @click="mode = mode === 'dark' ? 'light' : 'dark'"
      >
        <Sun v-if="mode === 'dark'" class="size-4" /><Moon v-else class="size-4" /> Theme
      </UiButton>
    </aside>

    <main class="min-w-0 flex-1 px-4 py-6 pb-24 md:px-8 md:pb-6">
      <RouterView />
    </main>

    <nav
      class="fixed inset-x-0 bottom-0 z-10 grid grid-cols-4 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <RouterLink
        v-for="item in nav"
        :key="item.to"
        :to="item.to"
        class="flex flex-col items-center gap-1 py-2 text-xs text-ink-muted"
        exact-active-class="!text-brand"
      >
        <component :is="item.icon" class="size-5" /> {{ item.label }}
      </RouterLink>
    </nav>
  </div>
</template>
