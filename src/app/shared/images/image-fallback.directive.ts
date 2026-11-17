import { Directive, ElementRef, inject, input } from '@angular/core'
import { IMAGE_PLACEHOLDER_DATA } from '../placeholder-data'

export const COVER_FALLBACK = 'assets/cover_fallback.webp'

@Directive({
  selector: 'img[daFallback]',
  host: { '(error)': 'onError()' },
})
export class ImageFallback {
  // 'cover' falls back to the cover artwork, anything else to a plain
  // placeholder.
  daFallback = input('', {
    transform: (value: string) => {
      return value === 'cover' ? COVER_FALLBACK : IMAGE_PLACEHOLDER_DATA
    },
  })

  private readonly el = inject<ElementRef<HTMLImageElement>>(ElementRef)
  private failed = false

  protected onError() {
    if (this.failed) {
      return
    }
    this.failed = true
    const img = this.el.nativeElement
    // srcset wins over src, so it has to go for the fallback to show.
    img.removeAttribute('srcset')
    img.removeAttribute('sizes')
    img.src = this.daFallback()
  }
}
