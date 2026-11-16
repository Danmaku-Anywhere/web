interface BangumiImageSet {
  large?: string
  common?: string
  medium?: string
  small?: string
  grid?: string
}

// The image loader resizes from the original, which is `large`. The other
// variants are only a fallback for records that lack it.
export function bangumiImageSource(
  images: BangumiImageSet | null | undefined
): string {
  return (
    images?.large ||
    images?.common ||
    images?.medium ||
    images?.small ||
    images?.grid ||
    ''
  )
}
