import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  signal,
} from '@angular/core'
import { Button } from '../../shared/ui/button'

const SCROLL_THRESHOLD = 400

@Component({
  selector: 'da-scroll-top',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button],
  template: `
    @if ($visible()) {
      <button
        daButton
        rounded
        iconOnly
        class="da-scroll-top"
        (click)="scrollToTop()"
      >
        <span class="pi pi-chevron-up" aria-hidden="true"></span>
      </button>
    }
  `,
})
export class ScrollTop {
  protected readonly $visible = signal(false)

  @HostListener('window:scroll')
  onWindowScroll() {
    this.$visible.set(window.scrollY > SCROLL_THRESHOLD)
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
