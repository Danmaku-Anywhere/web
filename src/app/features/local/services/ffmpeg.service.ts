import { Injectable } from '@angular/core'
import { FFmpeg } from '@ffmpeg/ffmpeg'

@Injectable({ providedIn: 'root' })
export class FfmpegService {
  private ffmpeg: FFmpeg | null = null
  private loading: Promise<FFmpeg> | null = null

  preload(): void {
    void this.getFFmpeg()
  }

  async getFFmpeg(): Promise<FFmpeg> {
    if (this.ffmpeg) {
      return this.ffmpeg
    }
    if (this.loading) {
      return this.loading
    }

    this.loading = this.initFFmpeg()
    try {
      this.ffmpeg = await this.loading
      return this.ffmpeg
    } finally {
      this.loading = null
    }
  }

  private async initFFmpeg(): Promise<FFmpeg> {
    const ffmpeg = new FFmpeg()
    try {
      await ffmpeg.load({
        coreURL: '/ffmpeg/ffmpeg-core.js',
        wasmURL: 'https://assets.danmaku.weeblify.app/ffmpeg/ffmpeg-core.wasm',
        classWorkerURL: '/ffmpeg/worker.js',
      })
    } catch (error) {
      ffmpeg.terminate()
      throw error
    }
    return ffmpeg
  }
}
