import JASSUB, { type JASSUBOptions } from 'jassub'

const ASSET_BASE = '/jassub'

/**
 * JASSUB's worker has bare imports, so it has to go through Angular's worker
 * bundler. JASSUB only accepts a URL and the bundler never exposes one, so the
 * constructor's single `new Worker` call is swapped for the bundled worker.
 */
export function createJassub(options: JASSUBOptions): JASSUB {
  const NativeWorker = globalThis.Worker
  globalThis.Worker = function BundledWorker(_url: string | URL) {
    const Worker = NativeWorker
    return new Worker(new URL('./jassub.worker', import.meta.url), {
      type: 'module',
      name: 'jassub-worker',
    })
  } as unknown as typeof Worker
  try {
    return new JASSUB({
      wasmUrl: `${ASSET_BASE}/jassub-worker.wasm`,
      wasmWorkerUrl: `${ASSET_BASE}/jassub-worker.js`,
      modernWasmUrl: `${ASSET_BASE}/jassub-worker-modern.wasm`,
      modernWasmWorkerUrl: `${ASSET_BASE}/jassub-worker-modern.js`,
      ...options,
    })
  } finally {
    globalThis.Worker = NativeWorker
  }
}
