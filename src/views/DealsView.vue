<script setup lang="ts">
import { computed, ref } from 'vue'
import { api } from '../../convex/_generated/api'
import { dealStages } from '../../convex/schema'
import { Trash2 } from '@lucide/vue'
import { useMutation, useQuery } from '@/lib/convex'
import { money } from '@/lib/format'
import { UiButton, UiCard, UiInput } from '@/components/ui'

const { data: deals } = useQuery(api.crm.listDeals)
const { mutate: create, isPending } = useMutation(api.crm.createDeal)
const { mutate: move } = useMutation(api.crm.moveDeal)
const { mutate: remove } = useMutation(api.crm.removeDeal)
const title = ref('')
const amount = ref('')

const columns = computed(() =>
  dealStages.map((stage) => ({
    stage,
    deals: (deals.value ?? []).filter((d) => d.stage === stage),
  })),
)

async function add() {
  if (!title.value.trim()) return
  await create({
    title: title.value,
    amountCents: Math.round(Number(amount.value || 0) * 100),
    stage: 'lead',
  })
  title.value = amount.value = ''
}
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-semibold">Deals</h1>
    <UiCard>
      <form class="grid gap-3 sm:grid-cols-3" @submit.prevent="add">
        <UiInput v-model="title" placeholder="Deal title" required />
        <UiInput v-model="amount" type="number" min="0" placeholder="Amount (USD)" />
        <UiButton type="submit" :loading="isPending">Add deal</UiButton>
      </form>
    </UiCard>
    <div class="flex snap-x gap-4 overflow-x-auto pb-2">
      <section
        v-for="col in columns"
        :key="col.stage"
        class="w-64 shrink-0 snap-start rounded-card bg-surface-2 p-3"
      >
        <h2 class="mb-3 text-sm font-semibold capitalize">
          {{ col.stage }} ({{ col.deals.length }})
        </h2>
        <div class="space-y-2">
          <article
            v-for="d in col.deals"
            :key="d._id"
            class="rounded-lg border border-line bg-surface p-3 text-sm"
          >
            <div class="flex items-start justify-between gap-2">
              <p class="font-medium">{{ d.title }}</p>
              <button
                class="text-ink-muted hover:text-danger"
                aria-label="Delete deal"
                @click="remove({ id: d._id })"
              >
                <Trash2 class="size-4" />
              </button>
            </div>
            <p class="text-ink-muted">{{ money(d.amountCents) }}</p>
            <select
              :value="d.stage"
              class="mt-2 w-full rounded border border-line bg-surface px-2 py-1 text-xs capitalize"
              @change="
                move({
                  id: d._id,
                  stage: ($event.target as HTMLSelectElement).value as typeof d.stage,
                })
              "
            >
              <option v-for="s in dealStages" :key="s" :value="s">{{ s }}</option>
            </select>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>
