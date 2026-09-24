<script setup lang="ts">
import { computed } from 'vue'
import { Activity, Radio, Zap } from '@lucide/vue'
import { api } from '../../convex/_generated/api'
import { useConnectionState, useMutation, useQuery } from '@/lib/convex'
import { UiBadge, UiButton, UiCard } from '@/components/ui'

const { data: health, error } = useQuery(api.system.health)
const { mutate: ping, isPending } = useMutation(api.system.ping)
const connection = useConnectionState()

const connected = computed(() => connection.value.isWebSocketConnected)
const deviceLabel = computed(() =>
  /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'phone' : 'desktop',
)

function sendPing() {
  void ping({ source: deviceLabel.value, userAgent: navigator.userAgent })
}

const timeFormat = new Intl.DateTimeFormat(undefined, { timeStyle: 'medium' })
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">Welcome to IASCA CRM</h1>
      <p class="mt-1 text-ink-muted">
        Foundation build — contacts, companies, deals and tasks are on the way.
      </p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <UiCard>
        <template #title>Backend status</template>
        <template #actions>
          <UiBadge :tone="connected ? 'success' : 'warning'">
            <Radio class="size-3" />
            {{ connected ? 'Live' : 'Connecting…' }}
          </UiBadge>
        </template>

        <p v-if="error" class="text-sm text-danger">{{ error.message }}</p>
        <p v-else-if="!health" class="text-sm text-ink-muted">Loading…</p>
        <dl v-else class="grid grid-cols-2 gap-3 text-sm">
          <div class="rounded-lg bg-surface-2 p-3">
            <dt class="text-ink-muted">Service</dt>
            <dd class="mt-1 font-medium">{{ health.app }}</dd>
          </div>
          <div class="rounded-lg bg-surface-2 p-3">
            <dt class="text-ink-muted">Heartbeats</dt>
            <dd class="mt-1 text-xl font-semibold tabular-nums">{{ health.heartbeats }}</dd>
          </div>
        </dl>
      </UiCard>

      <UiCard>
        <template #title>Live sync check</template>
        <p class="mb-4 text-sm text-ink-muted">
          Send a heartbeat from this {{ deviceLabel }}. Every open browser — including your phone —
          updates instantly.
        </p>
        <UiButton class="w-full sm:w-auto" :loading="isPending" @click="sendPing">
          <Zap class="size-4" /> Send heartbeat
        </UiButton>
      </UiCard>
    </div>

    <UiCard v-if="health?.recent.length">
      <template #title>Recent heartbeats</template>
      <ul class="divide-y divide-line">
        <li
          v-for="beat in health.recent"
          :key="beat.id"
          class="flex items-center gap-3 py-2.5 text-sm"
        >
          <Activity class="size-4 text-brand" />
          <span class="font-medium capitalize">{{ beat.source }}</span>
          <span class="ml-auto tabular-nums text-ink-muted">{{ timeFormat.format(beat.at) }}</span>
        </li>
      </ul>
    </UiCard>
  </div>
</template>
