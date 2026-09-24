import { computed, shallowRef, toValue, watch, type MaybeRefOrGetter } from 'vue'
import type { FunctionArgs, FunctionReference, FunctionReturnType } from 'convex/server'
import { convexToJson, type Value } from 'convex/values'
import { useConvexClient } from './plugin'

type QueryArgs<Q extends FunctionReference<'query'>> = FunctionArgs<Q> | 'skip'

/**
 * Reactive Convex query. Re-subscribes when `args` change; pass 'skip' to pause.
 * `data` is undefined while loading.
 */
export function useQuery<Q extends FunctionReference<'query'>>(
  query: Q,
  args: MaybeRefOrGetter<QueryArgs<Q>> = {} as FunctionArgs<Q>,
) {
  const client = useConvexClient()
  const data = shallowRef<FunctionReturnType<Q> | undefined>()
  const error = shallowRef<Error | undefined>()

  // Compare args by value so inline objects don't cause resubscribes on every render.
  const argsKey = computed(() => {
    const value = toValue(args)
    return value === 'skip' ? 'skip' : JSON.stringify(convexToJson(value as Value))
  })

  watch(
    argsKey,
    (key, _old, onCleanup) => {
      error.value = undefined
      if (key === 'skip') {
        data.value = undefined
        return
      }
      const subscription = client.onUpdate(
        query,
        toValue(args) as FunctionArgs<Q>,
        (result) => {
          data.value = result
          error.value = undefined
        },
        (err) => {
          error.value = err
        },
      )
      data.value = subscription.getCurrentValue()
      onCleanup(() => subscription())
    },
    { immediate: true },
  )

  const isLoading = computed(
    () => argsKey.value !== 'skip' && data.value === undefined && !error.value,
  )

  return { data, error, isLoading }
}
