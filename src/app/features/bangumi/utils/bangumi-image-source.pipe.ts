import { Pipe, type PipeTransform } from '@angular/core'
import { COVER_FALLBACK } from '../../../shared/images/image-fallback.directive'
import { bangumiImageSource } from './bangumi-image-source'

@Pipe({ name: 'bangumiImageSource' })
export class BangumiImageSourcePipe implements PipeTransform {
  transform(
    images: Parameters<typeof bangumiImageSource>[0],
    missing: 'cover' | 'none' = 'none'
  ): string {
    const source = bangumiImageSource(images)
    if (!source && missing === 'cover') {
      return COVER_FALLBACK
    }
    return source
  }
}
