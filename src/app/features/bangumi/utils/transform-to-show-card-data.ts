import { COVER_FALLBACK } from '../../../shared/images/image-fallback.directive'
import type { ShowCardData } from '../components/show-card'
import type { BgmSlimSubject } from '../types/bangumi.types'
import { bangumiImageSource } from './bangumi-image-source'

export const transformToShowCardData = (
  subject: BgmSlimSubject
): ShowCardData => {
  return {
    id: subject.id,
    altTitle: subject.name,
    title: subject.nameCN || subject.name,
    rating: subject.rating,
    rank: subject.rating.rank,
    cover: bangumiImageSource(subject.images) || COVER_FALLBACK,
  }
}
