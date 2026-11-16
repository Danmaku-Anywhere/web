import { describe, expect, it } from 'vitest'
import { bangumiImageLoader } from './bangumi-image-loader'

/**
 * Bangumi's image host resizes on the fly to 100, 200, 400, 800 or 1200px
 * and rejects any other width, so the loader rounds a requested width up to
 * the next one it serves. Images from anywhere else pass through untouched.
 */

const original = 'https://lain.bgm.tv/pic/cover/l/4f/2f/299673_l8B8U.jpg'

describe('bangumiImageLoader', () => {
  it('rounds the requested width up to a width the host serves', () => {
    expect(bangumiImageLoader({ src: original, width: 80 })).toBe(
      'https://lain.bgm.tv/r/100/pic/cover/l/4f/2f/299673_l8B8U.jpg'
    )
    expect(bangumiImageLoader({ src: original, width: 160 })).toBe(
      'https://lain.bgm.tv/r/200/pic/cover/l/4f/2f/299673_l8B8U.jpg'
    )
    expect(bangumiImageLoader({ src: original, width: 680 })).toBe(
      'https://lain.bgm.tv/r/800/pic/cover/l/4f/2f/299673_l8B8U.jpg'
    )
  })

  it('keeps an exact width as it is', () => {
    expect(bangumiImageLoader({ src: original, width: 400 })).toBe(
      'https://lain.bgm.tv/r/400/pic/cover/l/4f/2f/299673_l8B8U.jpg'
    )
  })

  it('caps the width at 1200px', () => {
    expect(bangumiImageLoader({ src: original, width: 2000 })).toBe(
      'https://lain.bgm.tv/r/1200/pic/cover/l/4f/2f/299673_l8B8U.jpg'
    )
  })

  it('resizes from the original when given an already resized or cropped URL', () => {
    expect(
      bangumiImageLoader({
        src: 'https://lain.bgm.tv/r/100x100/pic/crt/l/7b/3a/1_crt_FEkJM.jpg',
        width: 128,
      })
    ).toBe('https://lain.bgm.tv/r/200/pic/crt/l/7b/3a/1_crt_FEkJM.jpg')
  })

  it('upgrades http links to https', () => {
    expect(
      bangumiImageLoader({
        src: 'http://lain.bgm.tv/pic/user/m/000/00/00/1.jpg',
        width: 40,
      })
    ).toBe('https://lain.bgm.tv/r/100/pic/user/m/000/00/00/1.jpg')
  })

  it('returns the source unchanged when no width is asked for', () => {
    expect(bangumiImageLoader({ src: original })).toBe(original)
  })

  it('leaves images from other hosts alone', () => {
    expect(
      bangumiImageLoader({ src: 'https://example.com/a.jpg', width: 200 })
    ).toBe('https://example.com/a.jpg')
    expect(
      bangumiImageLoader({ src: 'assets/cover_fallback.webp', width: 200 })
    ).toBe('assets/cover_fallback.webp')
  })
})
