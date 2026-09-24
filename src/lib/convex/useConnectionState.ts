import { onScopeDispose, shallowRef } from 'vue'
import type { ConnectionState } from 'convex/browser'
import { useConvexClient } from './plugin'

export function useConnectionState() {
  const client = useConvexClient()
  const state = shallowRef<ConnectionState>(client.connectionState())
  const unsubscribe = client.subscribeToConnectionState((next) => {
    state.value = next
  })
  onScopeDispose(unsubscribe)
  return state
}
