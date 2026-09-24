import { inject, type App, type InjectionKey } from 'vue'
import type { ConvexClient } from 'convex/browser'
import { createConvexClient } from './client'

export const convexClientKey: InjectionKey<ConvexClient> = Symbol('convex-client')

export function createConvex(client: ConvexClient = createConvexClient()) {
  return {
    client,
    install(app: App) {
      app.provide(convexClientKey, client)
    },
  }
}

export function useConvexClient(): ConvexClient {
  const client = inject(convexClientKey)
  if (!client) throw new Error('Convex client not provided — did you app.use(createConvex())?')
  return client
}
