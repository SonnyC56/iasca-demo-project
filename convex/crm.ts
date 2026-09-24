import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { dealStage, dealStages } from './schema'

export const dashboard = query({
  args: {},
  handler: async (ctx) => {
    const [companies, contacts, deals] = await Promise.all([
      ctx.db.query('companies').collect(),
      ctx.db.query('contacts').collect(),
      ctx.db.query('deals').collect(),
    ])
    const byStage = dealStages.map((stage) => {
      const inStage = deals.filter((d) => d.stage === stage)
      return {
        stage,
        count: inStage.length,
        amountCents: inStage.reduce((s, d) => s + d.amountCents, 0),
      }
    })
    const open = deals.filter((d) => d.stage !== 'won' && d.stage !== 'lost')
    const won = deals.filter((d) => d.stage === 'won').length
    const closed = won + deals.filter((d) => d.stage === 'lost').length
    return {
      companies: companies.length,
      contacts: contacts.length,
      openPipelineCents: open.reduce((s, d) => s + d.amountCents, 0),
      winRate: closed ? Math.round((won / closed) * 100) : null,
      byStage,
    }
  },
})

export const listCompanies = query({
  args: {},
  handler: (ctx) => ctx.db.query('companies').withIndex('by_name').collect(),
})

export const createCompany = mutation({
  args: { name: v.string(), industry: v.optional(v.string()) },
  handler: (ctx, args) => ctx.db.insert('companies', { ...args, name: args.name.trim() }),
})

export const listContacts = query({
  args: {},
  handler: async (ctx) => {
    const contacts = await ctx.db.query('contacts').order('desc').collect()
    return Promise.all(
      contacts.map(async (c) => ({
        ...c,
        companyName: c.companyId ? (await ctx.db.get(c.companyId))?.name : undefined,
      })),
    )
  },
})

export const createContact = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    companyId: v.optional(v.id('companies')),
  },
  handler: (ctx, args) => ctx.db.insert('contacts', { ...args, name: args.name.trim() }),
})

export const listDeals = query({
  args: {},
  handler: (ctx) => ctx.db.query('deals').collect(),
})

export const createDeal = mutation({
  args: { title: v.string(), amountCents: v.number(), stage: dealStage },
  handler: (ctx, args) => ctx.db.insert('deals', { ...args, title: args.title.trim() }),
})

export const moveDeal = mutation({
  args: { id: v.id('deals'), stage: dealStage },
  handler: (ctx, { id, stage }) => ctx.db.patch(id, { stage }),
})

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    if (await ctx.db.query('companies').first()) return 'already seeded'
    const acme = await ctx.db.insert('companies', { name: 'Acme Corp', industry: 'Manufacturing' })
    const globex = await ctx.db.insert('companies', { name: 'Globex', industry: 'Software' })
    await ctx.db.insert('contacts', {
      name: 'Jane Smith',
      email: 'jane@acme.test',
      companyId: acme,
    })
    await ctx.db.insert('contacts', {
      name: 'Hank Scorpio',
      email: 'hank@globex.test',
      companyId: globex,
    })
    await ctx.db.insert('deals', {
      title: 'Acme annual plan',
      amountCents: 1200000,
      stage: 'proposal',
      companyId: acme,
    })
    await ctx.db.insert('deals', {
      title: 'Globex pilot',
      amountCents: 450000,
      stage: 'qualified',
      companyId: globex,
    })
    await ctx.db.insert('deals', {
      title: 'Acme add-on',
      amountCents: 200000,
      stage: 'won',
      companyId: acme,
    })
    await ctx.db.insert('deals', { title: 'Initech intro', amountCents: 300000, stage: 'lead' })
    return 'seeded'
  },
})

export const removeCompany = mutation({
  args: { id: v.id('companies') },
  handler: async (ctx, { id }) => {
    const contacts = await ctx.db
      .query('contacts')
      .withIndex('by_company', (q) => q.eq('companyId', id))
      .collect()
    for (const c of contacts) await ctx.db.patch(c._id, { companyId: undefined })
    const deals = await ctx.db.query('deals').collect()
    for (const d of deals)
      if (d.companyId === id) await ctx.db.patch(d._id, { companyId: undefined })
    await ctx.db.delete(id)
  },
})

export const removeContact = mutation({
  args: { id: v.id('contacts') },
  handler: (ctx, { id }) => ctx.db.delete(id),
})

export const removeDeal = mutation({
  args: { id: v.id('deals') },
  handler: (ctx, { id }) => ctx.db.delete(id),
})
