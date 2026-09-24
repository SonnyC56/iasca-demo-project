<script setup lang="ts">
import { api } from '../../convex/_generated/api'
import { useMutation, useQuery } from '@/lib/convex'
import { money } from '@/lib/format'
import { UiButton, UiCard } from '@/components/ui'

const { data } = useQuery(api.crm.dashboard)
const { mutate: seed, isPending } = useMutation(api.crm.seed)
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-3">
      <h1 class="text-2xl font-semibold">Dashboard</h1>
      <UiButton variant="secondary" size="sm" :loading="isPending" @click="seed({})"
        >Load sample data</UiButton
      >
    </div>
    <p v-if="!data" class="text-ink-muted">Loading…</p>
    <template v-else>
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <UiCard
          ><p class="text-sm text-ink-muted">Open pipeline</p>
          <p class="mt-1 text-2xl font-semibold">{{ money(data.openPipelineCents) }}</p></UiCard
        >
        <UiCard
          ><p class="text-sm text-ink-muted">Win rate</p>
          <p class="mt-1 text-2xl font-semibold">
            {{ data.winRate === null ? '—' : data.winRate + '%' }}
          </p></UiCard
        >
        <UiCard
          ><p class="text-sm text-ink-muted">Contacts</p>
          <p class="mt-1 text-2xl font-semibold">{{ data.contacts }}</p></UiCard
        >
        <UiCard
          ><p class="text-sm text-ink-muted">Companies</p>
          <p class="mt-1 text-2xl font-semibold">{{ data.companies }}</p></UiCard
        >
      </div>
      <UiCard>
        <template #title>Pipeline by stage</template>
        <div class="space-y-3">
          <div v-for="s in data.byStage" :key="s.stage">
            <div class="mb-1 flex justify-between text-sm">
              <span class="capitalize">{{ s.stage }} · {{ s.count }}</span
              ><span class="tabular-nums">{{ money(s.amountCents) }}</span>
            </div>
            <div class="h-2 rounded-full bg-surface-2">
              <div
                class="h-2 rounded-full bg-brand"
                :style="{
                  width:
                    (Math.max(...data.byStage.map((x) => x.amountCents))
                      ? (s.amountCents / Math.max(...data.byStage.map((x) => x.amountCents))) * 100
                      : 0) + '%',
                }"
              />
            </div>
          </div>
        </div>
      </UiCard>
    </template>
  </div>
</template>
