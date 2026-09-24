import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const APP_NAME = 'IASCA CRM'
const RECENT_LIMIT = 5

export const health = query({
  args: {},
  handler: async (ctx) => {
    const recent = await ctx.db.query('heartbeats').order('desc').take(RECENT_LIMIT)
    const total = (await ctx.db.query('heartbeats').collect()).length
    return {
      ok: true as const,
      app: APP_NAME,
      heartbeats: total,
      recent: recent.map((h) => ({
        id: h._id,
        source: h.source,
        at: h._creationTime,
      })),
    }
  },
})

export const ping = mutation({
  args: { source: v.string(), userAgent: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const source = args.source.trim().slice(0, 64) || 'unknown'
    return await ctx.db.insert('heartbeats', {
      source,
      userAgent: args.userAgent?.slice(0, 256),
    })
  },
})
