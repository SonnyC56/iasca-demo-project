<script setup lang="ts">
import { ref } from 'vue'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { useMutation, useQuery } from '@/lib/convex'
import { UiButton, UiCard, UiInput } from '@/components/ui'

const { data: contacts } = useQuery(api.crm.listContacts)
const { data: companies } = useQuery(api.crm.listCompanies)
const { mutate: create, isPending } = useMutation(api.crm.createContact)
const name = ref('')
const email = ref('')
const companyId = ref<Id<'companies'> | ''>('')

async function add() {
  if (!name.value.trim()) return
  await create({
    name: name.value,
    email: email.value || undefined,
    companyId: companyId.value || undefined,
  })
  name.value = email.value = ''
}
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-semibold">Contacts</h1>
    <UiCard>
      <form class="grid gap-3 sm:grid-cols-4" @submit.prevent="add">
        <UiInput v-model="name" placeholder="Name" required />
        <UiInput v-model="email" type="email" placeholder="Email" />
        <select
          v-model="companyId"
          class="h-10 rounded-lg border border-line bg-surface px-3 text-sm"
        >
          <option value="">No company</option>
          <option v-for="c in companies" :key="c._id" :value="c._id">{{ c.name }}</option>
        </select>
        <UiButton type="submit" :loading="isPending">Add contact</UiButton>
      </form>
    </UiCard>
    <UiCard>
      <p v-if="!contacts?.length" class="text-sm text-ink-muted">No contacts yet.</p>
      <ul class="divide-y divide-line">
        <li
          v-for="c in contacts"
          :key="c._id"
          class="flex flex-wrap justify-between gap-2 py-3 text-sm"
        >
          <span class="font-medium">{{ c.name }}</span>
          <span class="text-ink-muted">{{
            [c.email, c.companyName].filter(Boolean).join(' · ')
          }}</span>
        </li>
      </ul>
    </UiCard>
  </div>
</template>
