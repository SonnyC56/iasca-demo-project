import { ref, shallowRef } from 'vue'
import type { FunctionArgs, FunctionReference, FunctionReturnType } from 'convex/server'
import { useConvexClient } from './plugin'

export function useMutation<M extends FunctionReference<'mutation'>>(mutation: M) {
  const client = useConvexClient()
  const isPending = ref(false)
  const error = shallowRef<Error | undefined>()

  async function mutate(args: FunctionArgs<M>): Promise<Awaited<FunctionReturnType<M>>> {
    isPending.value = true
    error.value = undefined
    try {
      return await client.mutation(mutation, args)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      throw err
    } finally {
      isPending.value = false
    }
  }

  return { mutate, isPending, error }
}
