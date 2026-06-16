import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useReservationStore } from '../stores/reservation'
import { releaseReservation } from '../api/reservations'

/**
 * Lifecycle contract:
 *
 * onMounted — Snapshots secondsLeft from (store.expiresAt - now). If > 0,
 *   starts a 1-second setInterval. If ≤ 0 and stale data is in the store
 *   (e.g. page reload after TTL elapsed), calls handleExpiry immediately to
 *   clean up without waiting for a tick.
 *
 * tick (every 1 s) — Recomputes secondsLeft from the wall clock. When it
 *   reaches 0 it calls handleExpiry exactly once (clearInterval inside
 *   handleExpiry prevents any re-entry even though tick is async-unaware).
 *
 * handleExpiry — Synchronously: clears the interval, clears store + session-
 *   Storage, sets expired = true so the UI can swap to the expiry message.
 *   Then asynchronously: fires best-effort DELETE for every held UUID. The
 *   backend's 10-minute Redis TTL is the safety net; these calls merely
 *   return inventory sooner so other buyers can see availability immediately.
 *
 * onUnmounted — Clears the interval but intentionally leaves the store
 *   intact. If the user navigates away (back button, accidental click) the
 *   hold is still live in sessionStorage. When they return to /checkout the
 *   composable remounts, picks up the remaining seconds, and resumes the
 *   countdown from wherever it left off.
 */
export function useReservation() {
  const store = useReservationStore()
  const secondsLeft = ref(0)
  const expired = ref(false)
  let intervalId: ReturnType<typeof setInterval> | null = null

  function computeSeconds(): number {
    if (!store.expiresAt) return 0
    return Math.max(0, Math.floor(store.expiresAt - Date.now() / 1000))
  }

  async function handleExpiry(): Promise<void> {
    clearInterval(intervalId ?? undefined)
    intervalId = null

    const uuids = store.items.map(i => i.uuid)
    store.clear()
    expired.value = true

    await Promise.allSettled(uuids.map(releaseReservation))
  }

  function tick(): void {
    secondsLeft.value = computeSeconds()
    if (secondsLeft.value === 0) handleExpiry()
  }

  onMounted(() => {
    secondsLeft.value = computeSeconds()
    if (secondsLeft.value > 0) {
      intervalId = setInterval(tick, 1000)
    } else if (store.hasReservation) {
      handleExpiry()
    }
  })

  onUnmounted(() => {
    clearInterval(intervalId ?? undefined)
  })

  const countdownDisplay = computed(() => {
    const m = Math.floor(secondsLeft.value / 60)
    const s = secondsLeft.value % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  })

  return { secondsLeft, countdownDisplay, expired, store }
}
