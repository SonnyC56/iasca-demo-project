import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export const dealStages = ['lead', 'qualified', 'proposal', 'won', 'lost'] as const
export const dealStage = v.union(...dealStages.map((s) => v.literal(s)))

export default defineSchema({
  heartbeats: defineTable({
    source: v.string(),
    userAgent: v.optional(v.string()),
  }),
  companies: defineTable({
    name: v.string(),
    industry: v.optional(v.string()),
  }).index('by_name', ['name']),
  contacts: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    companyId: v.optional(v.id('companies')),
  }).index('by_company', ['companyId']),
  deals: defineTable({
    title: v.string(),
    amountCents: v.number(),
    stage: dealStage,
    companyId: v.optional(v.id('companies')),
  }).index('by_stage', ['stage']),
})
