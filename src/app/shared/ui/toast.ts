import { Overlay, type OverlayRef } from '@angular/cdk/overlay'
import { TemplatePortal } from '@angular/cdk/portal'
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injectable,
  inject,
  input,
  signal,
  type TemplateRef,
  ViewContainerRef,
  viewChild,
} from '@angular/core'
import { Icon, type IconName } from './icon'

export type ToastSeverity = 'success' | 'info' | 'error'

export interface ToastMessage {
  severity: ToastSeverity
  summary?: string
  detail?: string
  life?: number
  closable?: boolean
}

interface ShownToast extends ToastMessage {
  id: number
}

const SEVERITY_ICONS: Record<ToastSeverity, IconName> = {
  success: 'check',
  info: 'info-circle',
  error: 'times-circle',
}

let nextId = 0

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly $_toasts = signal<ShownToast[]>([])
  readonly $toasts = this.$_toasts.asReadonly()
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>()

  add(message: ToastMessage) {
    const toast = { ...message, id: nextId++ }
    this.$_toasts.update((toasts) => [...toasts, toast])
    this.resume(toast)
  }

  remove(id: number) {
    this.pause(id)
    this.$_toasts.update((toasts) => toasts.filter((t) => t.id !== id))
  }

  pause(id: number) {
    clearTimeout(this.timers.get(id))
    this.timers.delete(id)
  }

  resume(toast: ShownToast) {
    this.pause(toast.id)
    this.timers.set(
      toast.id,
      setTimeout(() => {
        this.remove(toast.id)
      }, toast.life ?? 3000)
    )
  }
}

@Component({
  selector: 'da-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <ng-template #list>
      <div class="da-toast">
        @for (toast of toastService.$toasts(); track toast.id) {
          <div
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            [class]="'da-toast-message da-toast-message-' + toast.severity"
            animate.enter="da-toast-message-enter"
            animate.leave="da-toast-message-leave"
            (mouseenter)="toastService.pause(toast.id)"
            (mouseleave)="toastService.resume(toast)"
          >
            <div class="da-toast-message-content">
              <svg class="da-toast-message-icon" [daIcon]="icons[toast.severity]"></svg>
              <div class="da-toast-message-text">
                <div class="da-toast-summary">{{ toast.summary }}</div>
                <div class="da-toast-detail">{{ toast.detail }}</div>
              </div>
              @if (toast.closable !== false) {
                <div>
                  <button
                    type="button"
                    class="da-toast-close-button"
                    aria-label="Close"
                    (click)="toastService.remove(toast.id)"
                  >
                    <svg class="da-toast-close-icon" daIcon="times"></svg>
                  </button>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </ng-template>
  `,
})
export class Toast {
  protected readonly toastService = inject(ToastService)
  private readonly overlay = inject(Overlay)
  private readonly viewContainerRef = inject(ViewContainerRef)

  position = input.required<'top-center' | 'bottom-center'>()

  protected readonly icons = SEVERITY_ICONS
  private readonly $list = viewChild.required<TemplateRef<unknown>>('list')
  private overlayRef: OverlayRef | null = null

  constructor() {
    afterNextRender(() => {
      this.overlayRef = this.overlay.create({
        positionStrategy: this.positionStrategy(),
        maxWidth: 'none',
      })
      // Above the dialog panes and masks, which share the overlay container.
      this.overlayRef.hostElement.style.zIndex = '1102'
      this.overlayRef.attach(
        new TemplatePortal(this.$list(), this.viewContainerRef)
      )
    })

    inject(DestroyRef).onDestroy(() => {
      this.overlayRef?.dispose()
    })
  }

  private positionStrategy() {
    const strategy = this.overlay.position().global().centerHorizontally()
    if (this.position() === 'top-center') {
      return strategy.top('20px')
    }
    return strategy.bottom('20px')
  }
}
