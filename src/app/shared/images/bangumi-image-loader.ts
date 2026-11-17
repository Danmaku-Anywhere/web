import type { ImageLoaderConfig } from '@angular/common'

// lain.bgm.tv resizes any /pic/ image on the fly, but only to these widths.
// Other widths return 400 Bad Request.
const BANGUMI_WIDTHS = [100, 200, 400, 800, 1200]

const BANGUMI_IMAGE =
  /^https?:\/\/lain\.bgm\.tv\/(?:r\/\d+(?:x\d+)?\/)?(pic\/.+)$/

export function bangumiImageLoader(config: ImageLoaderConfig): string {
  const match = BANGUMI_IMAGE.exec(config.src)
  if (!match || !config.width) {
    return config.src
  }
  const requested = config.width
  const width =
    BANGUMI_WIDTHS.find((candidate) => candidate >= requested) ??
    BANGUMI_WIDTHS[BANGUMI_WIDTHS.length - 1]
  return `https://lain.bgm.tv/r/${width}/${match[1]}`
}
