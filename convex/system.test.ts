import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'
import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

describe('system', () => {
  it('reports health with no heartbeats', async () => {
    const t = convexTest(schema, modules)
    const health = await t.query(api.system.health, {})
    expect(health).toMatchObject({ ok: true, app: 'IASCA CRM', heartbeats: 0, recent: [] })
  })

  it('records pings newest-first and sanitizes the source', async () => {
    const t = convexTest(schema, modules)
    await t.mutation(api.system.ping, { source: 'desktop' })
    await t.mutation(api.system.ping, { source: `  ${'x'.repeat(100)}  ` })

    const health = await t.query(api.system.health, {})
    expect(health.heartbeats).toBe(2)
    expect(health.recent.map((r) => r.source)).toEqual(['x'.repeat(64), 'desktop'])
  })

  it('falls back to "unknown" for a blank source', async () => {
    const t = convexTest(schema, modules)
    await t.mutation(api.system.ping, { source: '   ' })
    const health = await t.query(api.system.health, {})
    expect(health.recent[0]?.source).toBe('unknown')
  })
})
