import { Overlay, type OverlayRef } from '@angular/cdk/overlay'
import { TemplatePortal } from '@angular/cdk/portal'
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  Injectable,
  inject,
  input,
  signal,
  type TemplateRef,
  untracked,
  ViewContainerRef,
  viewChild,
} from '@angular/core'
import { Subject } from 'rxjs'
import { Icon, type IconName } from './icon'

export type ToastSeverity =
  | 'success'
  | 'info'
  | 'warn'
  | 'error'
  | 'secondary'
  | 'contrast'

export type ToastPosition = 'top-center' | 'bottom-center'

export interface ToastMessage {
  severity?: ToastSeverity
  summary?: string
  detail?: string
  life?: number
  sticky?: boolean
  closable?: boolean
  key?: string
}

type ToastEvent =
  | { type: 'add'; message: ToastMessage }
  | { type: 'clear'; key?: string }

const DEFAULT_LIFE = 3000

const SEVERITY_ICONS: Record<ToastSeverity, IconName> = {
  success: 'check',
  info: 'info-circle',
  warn: 'exclamation-triangle',
  error: 'times-circle',
  secondary: 'info-circle',
  contrast: 'info-circle',
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly events = new Subject<ToastEvent>()
  readonly events$ = this.events.asObservable()

  add(message: ToastMessage) {
    this.events.next({ type: 'add', message })
  }

  clear(key?: string) {
    this.events.next({ type: 'clear', key })
  }
}

interface ShownToast {
  id: number
  message: ToastMessage
  severity: ToastSeverity
  icon: IconName
}

let nextId = 0

@Component({
  selector: 'da-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <ng-template #list>
      <div class="da-toast">
        @for (toast of $toasts(); track toast.id) {
          <div
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            [class]="'da-toast-message da-toast-message-' + toast.severity"
            animate.enter="da-toast-message-enter"
            animate.leave="da-toast-message-leave"
            (mouseenter)="pause(toast.id)"
            (mouseleave)="resume(toast)"
          >
            <div class="da-toast-message-content">
              <svg class="da-toast-message-icon" [daIcon]="toast.icon"></svg>
              <div class="da-toast-message-text">
                <div class="da-toast-summary">{{ toast.message.summary }}</div>
                <div class="da-toast-detail">{{ toast.message.detail }}</div>
              </div>
              @if (toast.message.closable !== false) {
                <div>
                  <button
                    type="button"
                    class="da-toast-close-button"
                    aria-label="Close"
                    (click)="remove(toast.id)"
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
  private readonly overlay = inject(Overlay)
  private readonly viewContainerRef = inject(ViewContainerRef)
  private readonly toastService = inject(ToastService)

  position = input<ToastPosition>('top-center')
  key = input<string>()

  protected readonly $toasts = signal<ShownToast[]>([])
  private readonly $list = viewChild.required<TemplateRef<unknown>>('list')
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>()
  private overlayRef: OverlayRef | null = null

  constructor() {
    const subscription = this.toastService.events$.subscribe((event) => {
      if (event.type === 'add') {
        this.show(event.message)
      } else if (event.key === undefined || event.key === this.key()) {
        this.clearAll()
      }
    })

    afterNextRender(() => {
      this.overlayRef = this.overlay.create({
        positionStrategy: this.positionStrategy(untracked(this.position)),
        maxWidth: 'none',
      })
      // Above the dialog panes and masks, which share the overlay container.
      this.overlayRef.hostElement.style.zIndex = '1102'
      this.overlayRef.attach(
        new TemplatePortal(this.$list(), this.viewContainerRef)
      )
    })

    effect(() => {
      const position = this.position()
      untracked(() => {
        this.overlayRef?.updatePositionStrategy(this.positionStrategy(position))
      })
    })

    inject(DestroyRef).onDestroy(() => {
      subscription.unsubscribe()
      this.clearAll()
      this.overlayRef?.dispose()
    })
  }

  protected pause(id: number) {
    this.clearTimer(id)
  }

  protected resume(toast: ShownToast) {
    this.startTimer(toast)
  }

  protected remove(id: number) {
    this.clearTimer(id)
    this.$toasts.update((toasts) => toasts.filter((t) => t.id !== id))
  }

  private show(message: ToastMessage) {
    if (message.key !== this.key()) {
      return
    }
    const severity = message.severity ?? 'info'
    const toast: ShownToast = {
      id: nextId++,
      message,
      severity,
      icon: SEVERITY_ICONS[severity],
    }
    this.$toasts.update((toasts) => [...toasts, toast])
    this.startTimer(toast)
  }

  private startTimer(toast: ShownToast) {
    if (toast.message.sticky) {
      return
    }
    this.clearTimer(toast.id)
    this.timers.set(
      toast.id,
      setTimeout(() => {
        this.remove(toast.id)
      }, toast.message.life || DEFAULT_LIFE)
    )
  }

  private clearTimer(id: number) {
    const timer = this.timers.get(id)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(id)
    }
  }

  private clearAll() {
    for (const timer of this.timers.values()) {
      clearTimeout(timer)
    }
    this.timers.clear()
    this.$toasts.set([])
  }

  private positionStrategy(position: ToastPosition) {
    const strategy = this.overlay.position().global().centerHorizontally()
    if (position === 'top-center') {
      return strategy.top('20px')
    }
    return strategy.bottom('20px')
  }
}
