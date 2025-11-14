const threeMinutesInMs = 3 * 60 * 1000
export const UPDATE_INTERVAL = threeMinutesInMs

type MaybePromise = void | Promise<void>

const callbacks = new Set<() => MaybePromise>()
let intervalId: number | null = null

export function registerPeriodicTask(cb: () => MaybePromise): () => void {
  callbacks.add(cb)
  return () => callbacks.delete(cb)
}

export async function runOnce(): Promise<void> {
  const tasks = Array.from(callbacks).map((cb) => {
    try {
      return Promise.resolve(cb())
    } catch (err) {
      return Promise.reject(err)
    }
  })
  await Promise.allSettled(tasks)
}

function runAll(): void {
  callbacks.forEach((cb) => {
    try {
      const res = cb()
      if (res && typeof (res as Promise<void>).then === 'function') {
        ;(res as Promise<void>).catch((err) => console.error('Periodic task error:', err))
      }
    } catch (err) {
      console.error('Periodic task error (sync):', err)
    }
  })
}

export function startPeriodicUpdates(): void {
  if (intervalId) return
  runAll()
  intervalId = window.setInterval(() => {
    runAll()
  }, UPDATE_INTERVAL)
}

export function stopPeriodicUpdates(): void {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}
