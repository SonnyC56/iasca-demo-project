import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'
import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

describe('crm', () => {
  it('computes dashboard totals and win rate', async () => {
    const t = convexTest(schema, modules)
    await t.mutation(api.crm.createDeal, { title: 'A', amountCents: 1000, stage: 'lead' })
    await t.mutation(api.crm.createDeal, { title: 'B', amountCents: 500, stage: 'won' })
    await t.mutation(api.crm.createDeal, { title: 'C', amountCents: 700, stage: 'lost' })
    const d = await t.query(api.crm.dashboard, {})
    expect(d.openPipelineCents).toBe(1000)
    expect(d.winRate).toBe(50)
    expect(d.byStage.find((s) => s.stage === 'won')).toMatchObject({ count: 1, amountCents: 500 })
  })

  it('reports no win rate without closed deals', async () => {
    const t = convexTest(schema, modules)
    expect((await t.query(api.crm.dashboard, {})).winRate).toBeNull()
  })

  it('moves deals between stages', async () => {
    const t = convexTest(schema, modules)
    const id = await t.mutation(api.crm.createDeal, { title: 'A', amountCents: 1, stage: 'lead' })
    await t.mutation(api.crm.moveDeal, { id, stage: 'proposal' })
    expect((await t.query(api.crm.listDeals, {}))[0]?.stage).toBe('proposal')
  })

  it('unlinks contacts when their company is removed', async () => {
    const t = convexTest(schema, modules)
    const companyId = await t.mutation(api.crm.createCompany, { name: 'Acme' })
    await t.mutation(api.crm.createContact, { name: 'Jane', companyId })
    await t.mutation(api.crm.removeCompany, { id: companyId })
    const [jane] = await t.query(api.crm.listContacts, {})
    expect(jane?.companyId).toBeUndefined()
    expect(jane?.companyName).toBeUndefined()
  })

  it('seeds only once', async () => {
    const t = convexTest(schema, modules)
    expect(await t.mutation(api.crm.seed, {})).toBe('seeded')
    expect(await t.mutation(api.crm.seed, {})).toBe('already seeded')
  })
})
