import {
  Dialog as CdkDialog,
  CdkDialogContainer,
  type DialogRef,
} from '@angular/cdk/dialog'
import { hasModifierKey } from '@angular/cdk/keycodes'
import { CdkPortalOutlet } from '@angular/cdk/portal'
import { DOCUMENT } from '@angular/common'
import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  contentChild,
  DestroyRef,
  Directive,
  effect,
  Injectable,
  Injector,
  inject,
  input,
  output,
  type TemplateRef,
  untracked,
  viewChild,
} from '@angular/core'
import { Button } from './button'
import { Icon } from './icon'

const LEAVE_MS = 300

const TABBABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function firstTabbable(root: Element | null): HTMLElement | null {
  if (!root) {
    return null
  }
  return root.querySelector<HTMLElement>(TABBABLE)
}

@Component({
  selector: 'da-dialog-container',
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [CdkPortalOutlet],
  template: '<ng-template cdkPortalOutlet />',
  host: {
    class: 'da-dialog-container',
  },
})
export class DialogContainer extends CdkDialogContainer {}

@Injectable({ providedIn: 'root' })
export class ScrollLock {
  private readonly document = inject(DOCUMENT)
  private count = 0

  lock() {
    this.count++
    if (this.count > 1) {
      return
    }
    const view = this.document.defaultView
    const html = this.document.documentElement
    const scrollbar = view ? view.innerWidth - html.clientWidth : 0
    this.document.body.style.setProperty(
      '--da-scrollbar-width',
      `${scrollbar}px`
    )
    this.document.body.classList.add('da-overflow-hidden')
  }

  unlock() {
    this.count = Math.max(0, this.count - 1)
    if (this.count > 0) {
      return
    }
    this.document.body.classList.remove('da-overflow-hidden')
    this.document.body.style.removeProperty('--da-scrollbar-width')
  }
}

@Directive({ selector: '[daDialogHeader]' })
export class DialogHeader {}

@Directive({ selector: '[daDialogFooter]' })
export class DialogFooter {}

let nextId = 0

@Component({
  selector: 'da-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, Icon],
  template: `
    <ng-template #panel>
      @if (!headless()) {
        <div class="da-dialog-header">
          @if ($customHeader()) {
            <div class="contents" [id]="titleId">
              <ng-content select="[daDialogHeader]" />
            </div>
          } @else {
            <span class="da-dialog-title" [id]="titleId">{{ header() }}</span>
          }
          <div class="da-dialog-header-actions">
            @if (closable()) {
              <button
                daButton
                iconOnly
                rounded
                variant="text"
                severity="secondary"
                class="da-dialog-close-button"
                aria-label="Close"
                (click)="requestClose()"
              >
                <svg daIcon="times"></svg>
              </button>
            }
          </div>
        </div>
      }
      <div
        data-dialog-body
        [class]="headless() ? 'contents' : 'da-dialog-content ' + contentClass()"
      >
        <ng-content />
      </div>
      @if (!headless() && $customFooter()) {
        <div class="da-dialog-footer" data-dialog-footer>
          <ng-content select="[daDialogFooter]" />
        </div>
      }
    </ng-template>
  `,
})
export class Dialog {
  private readonly cdkDialog = inject(CdkDialog)
  private readonly scrollLock = inject(ScrollLock)
  private readonly injector = inject(Injector)
  private readonly document = inject(DOCUMENT)

  visible = input(false)
  header = input<string>()
  role = input<'dialog' | 'alertdialog'>('dialog')
  ariaLabel = input<string>()
  closable = input(true, { transform: booleanAttribute })
  closeOnEscape = input(true, { transform: booleanAttribute })
  dismissableMask = input(false, { transform: booleanAttribute })
  headless = input(false, { transform: booleanAttribute })
  maskClass = input('')
  panelClass = input('')
  contentClass = input('')

  visibleChange = output<boolean>()
  shown = output<void>()
  hidden = output<void>()

  protected readonly titleId = `da-dialog-title-${nextId++}`
  protected readonly $customHeader = contentChild(DialogHeader)
  protected readonly $customFooter = contentChild(DialogFooter)
  private readonly $panel = viewChild.required<TemplateRef<unknown>>('panel')

  private ref: DialogRef<unknown, unknown> | null = null
  private destroyed = false
  private leaveTimer: ReturnType<typeof setTimeout> | null = null

  constructor() {
    effect(() => {
      const visible = this.visible()
      untracked(() => {
        if (visible) {
          this.open()
        } else {
          this.hide()
        }
      })
    })
    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true
      this.clearLeave()
      this.ref?.close()
    })
  }

  requestClose() {
    this.visibleChange.emit(false)
    this.hide()
  }

  private open() {
    if (this.ref) {
      this.cancelLeave()
      return
    }
    const ref = this.cdkDialog.open(this.$panel(), {
      container: DialogContainer,
      role: this.role(),
      ariaModal: true,
      ariaLabel: this.ariaLabel() ?? null,
      ariaLabelledBy: this.ariaLabel() ? null : this.titleId,
      autoFocus: false,
      restoreFocus: true,
      disableClose: true,
      disableAnimations: true,
      hasBackdrop: true,
      backdropClass: ['da-dialog-mask', ...splitClasses(this.maskClass())],
      panelClass: ['da-dialog', ...splitClasses(this.panelClass())],
      maxHeight: '90%',
    })
    this.ref = ref
    this.scrollLock.lock()

    ref.keydownEvents.subscribe((event) => {
      if (
        event.key === 'Escape' &&
        this.closeOnEscape() &&
        !hasModifierKey(event)
      ) {
        event.preventDefault()
        this.requestClose()
      }
    })
    ref.backdropClick.subscribe(() => {
      if (this.dismissableMask()) {
        this.requestClose()
      }
    })
    ref.closed.subscribe(() => {
      this.clearLeave()
      this.ref = null
      this.scrollLock.unlock()
      if (!this.destroyed) {
        this.hidden.emit()
      }
    })

    afterNextRender(
      () => {
        if (this.ref !== ref) {
          return
        }
        this.focusInitial(ref.overlayRef.overlayElement)
        this.shown.emit()
      },
      { injector: this.injector }
    )
  }

  private focusInitial(pane: HTMLElement) {
    const target =
      firstTabbable(pane.querySelector('[data-dialog-body]')) ??
      firstTabbable(pane.querySelector('[data-dialog-footer]')) ??
      firstTabbable(pane)
    if (target) {
      target.focus()
      return
    }
    pane.querySelector<HTMLElement>('.da-dialog-container')?.focus()
  }

  private hide() {
    const ref = this.ref
    if (!ref || this.leaveTimer) {
      return
    }
    if (this.prefersReducedMotion()) {
      ref.close()
      return
    }
    ref.overlayRef.overlayElement.classList.add('da-dialog-leave')
    ref.overlayRef.backdropElement?.classList.add('da-dialog-mask-leave')
    this.leaveTimer = setTimeout(() => {
      this.leaveTimer = null
      ref.close()
    }, LEAVE_MS)
  }

  private cancelLeave() {
    if (!this.ref || !this.leaveTimer) {
      return
    }
    this.clearLeave()
    this.ref.overlayRef.overlayElement.classList.remove('da-dialog-leave')
    this.ref.overlayRef.backdropElement?.classList.remove(
      'da-dialog-mask-leave'
    )
  }

  private clearLeave() {
    if (this.leaveTimer) {
      clearTimeout(this.leaveTimer)
      this.leaveTimer = null
    }
  }

  private prefersReducedMotion() {
    return (
      this.document.defaultView?.matchMedia?.(
        '(prefers-reduced-motion: reduce)'
      ).matches ?? false
    )
  }
}

function splitClasses(value: string): string[] {
  return value.split(/\s+/).filter(Boolean)
}
