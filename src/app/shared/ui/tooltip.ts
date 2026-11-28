import { Overlay, type OverlayRef } from '@angular/cdk/overlay'
import { ComponentPortal } from '@angular/cdk/portal'
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  numberAttribute,
  signal,
} from '@angular/core'

@Component({
  selector: 'da-tooltip-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="da-tooltip-arrow"></div>
    <div class="da-tooltip-text">{{ text() }}</div>
  `,
  host: {
    class: 'da-tooltip',
    role: 'tooltip',
    '[id]': 'id()',
  },
})
export class TooltipPanel {
  id = input.required<string>()
  text = input.required<string>()
}

let nextId = 0

@Directive({
  selector: '[daTooltip]',
  host: {
    '(mouseenter)': 'schedule()',
    '(mouseleave)': 'hide()',
    '[attr.aria-describedby]': '$shown() ? id : null',
  },
})
export class Tooltip {
  private readonly overlay = inject(Overlay)
  private readonly host: HTMLElement = inject(ElementRef).nativeElement

  daTooltip = input.required<string>()
  tooltipDelay = input(0, { transform: numberAttribute })

  protected readonly id = `da-tooltip-${nextId++}`
  protected readonly $shown = signal(false)
  private overlayRef: OverlayRef | null = null
  private timer: ReturnType<typeof setTimeout> | null = null

  constructor() {
    inject(DestroyRef).onDestroy(() => this.hide())
  }

  protected schedule() {
    this.clearTimer()
    this.timer = setTimeout(() => this.show(), this.tooltipDelay())
  }

  protected hide() {
    this.clearTimer()
    this.overlayRef?.dispose()
    this.overlayRef = null
    this.$shown.set(false)
  }

  private show() {
    this.timer = null
    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.host)
        .withPositions([
          {
            originX: 'center',
            originY: 'top',
            overlayX: 'center',
            overlayY: 'bottom',
          },
        ]),
      scrollStrategy: this.overlay.scrollStrategies.close(),
    })
    const panel = this.overlayRef.attach(new ComponentPortal(TooltipPanel))
    panel.setInput('id', this.id)
    panel.setInput('text', this.daTooltip())
    this.$shown.set(true)
  }

  private clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }
}
