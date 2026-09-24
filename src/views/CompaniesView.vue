<script setup lang="ts">
import { ref } from 'vue'
import { api } from '../../convex/_generated/api'
import { Trash2 } from '@lucide/vue'
import { useMutation, useQuery } from '@/lib/convex'
import { UiButton, UiCard, UiInput } from '@/components/ui'

const { data: companies } = useQuery(api.crm.listCompanies)
const { mutate: create, isPending } = useMutation(api.crm.createCompany)
const { mutate: remove } = useMutation(api.crm.removeCompany)
const name = ref('')
const industry = ref('')

async function add() {
  if (!name.value.trim()) return
  await create({ name: name.value, industry: industry.value || undefined })
  name.value = industry.value = ''
}
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-semibold">Companies</h1>
    <UiCard>
      <form class="grid gap-3 sm:grid-cols-3" @submit.prevent="add">
        <UiInput v-model="name" placeholder="Company name" required />
        <UiInput v-model="industry" placeholder="Industry" />
        <UiButton type="submit" :loading="isPending">Add company</UiButton>
      </form>
    </UiCard>
    <UiCard>
      <p v-if="!companies?.length" class="text-sm text-ink-muted">No companies yet.</p>
      <ul class="divide-y divide-line">
        <li v-for="c in companies" :key="c._id" class="flex justify-between py-3 text-sm">
          <span class="font-medium">{{ c.name }}</span
          ><span class="text-ink-muted">{{ c.industry }}</span>
          <button
            class="text-ink-muted hover:text-danger"
            aria-label="Delete"
            @click="remove({ id: c._id })"
          >
            <Trash2 class="size-4" />
          </button>
        </li>
      </ul>
    </UiCard>
  </div>
</template>
