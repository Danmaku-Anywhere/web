import { TestBed } from '@angular/core/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  instances: [] as unknown[],
  loadError: null as Error | null,
}))

vi.mock('@ffmpeg/ffmpeg', () => {
  class FFmpeg {
    load = vi.fn(async () => {
      if (state.loadError) {
        throw state.loadError
      }
    })
    terminate = vi.fn()
    constructor() {
      state.instances.push(this)
    }
  }
  return { FFmpeg }
})

import { FfmpegService } from './ffmpeg.service'

interface FakeFFmpeg {
  load: ReturnType<typeof vi.fn>
  terminate: ReturnType<typeof vi.fn>
}

describe('FfmpegService', () => {
  beforeEach(() => {
    state.instances.length = 0
    state.loadError = null
    TestBed.configureTestingModule({})
  })

  it('terminates the instance when loading fails', async () => {
    const service = TestBed.inject(FfmpegService)
    state.loadError = new Error('wasm fetch failed')

    await expect(service.getFFmpeg()).rejects.toBe(state.loadError)
    expect((state.instances[0] as FakeFFmpeg).terminate).toHaveBeenCalledOnce()
  })

  it('reuses one loaded instance across calls', async () => {
    const service = TestBed.inject(FfmpegService)

    const first = await service.getFFmpeg()
    const second = await service.getFFmpeg()

    expect(first).toBe(second)
    expect(state.instances).toHaveLength(1)
    expect((state.instances[0] as FakeFFmpeg).terminate).not.toHaveBeenCalled()
  })
})
