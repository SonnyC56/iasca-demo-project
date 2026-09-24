import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  // Foundation smoke-test table: proves the client ↔ backend round trip and live updates.
  // CRM tables (members, contacts, companies, deals, …) arrive in later milestones.
  heartbeats: defineTable({
    source: v.string(),
    userAgent: v.optional(v.string()),
  }),
})
