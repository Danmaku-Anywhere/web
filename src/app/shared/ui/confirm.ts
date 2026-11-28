import {
  ChangeDetectionStrategy,
  Component,
  computed,
  Injectable,
  inject,
  signal,
} from '@angular/core'
import { Button, type ButtonSeverity, type ButtonVariant } from './button'
import { Dialog, DialogFooter } from './dialog'

export interface ConfirmButtonProps {
  label?: string
  severity?: ButtonSeverity
  variant?: ButtonVariant
}

export interface ConfirmOptions {
  header?: string
  message?: string
  closable?: boolean
  acceptButtonProps?: ConfirmButtonProps
  rejectButtonProps?: ConfirmButtonProps
  accept?: () => void
  reject?: () => void
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly $_current = signal<ConfirmOptions | null>(null)
  readonly $current = this.$_current.asReadonly()

  confirm(options: ConfirmOptions) {
    this.$_current.set(options)
  }

  close() {
    this.$_current.set(null)
  }
}

@Component({
  selector: 'da-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Dialog, DialogFooter, Button],
  template: `
    <da-dialog
      [role]="'alertdialog'"
      panelClass="da-confirm-dialog"
      [visible]="$visible()"
      [header]="$options().header"
      [closable]="$closable()"
      [closeOnEscape]="$closable()"
      (visibleChange)="onDismiss()"
    >
      <span class="da-confirm-dialog-message">{{ $options().message }}</span>
      <ng-container daDialogFooter>
        <button
          daButton
          [severity]="$reject().severity ?? 'secondary'"
          [variant]="$reject().variant ?? 'solid'"
          (click)="onReject()"
        >
          {{ $reject().label ?? 'No' }}
        </button>
        <button
          daButton
          [severity]="$accept().severity ?? 'primary'"
          [variant]="$accept().variant ?? 'solid'"
          (click)="onAccept()"
        >
          {{ $accept().label ?? 'Yes' }}
        </button>
      </ng-container>
    </da-dialog>
  `,
})
export class ConfirmDialog {
  private readonly confirmService = inject(ConfirmService)

  private readonly $_last = signal<ConfirmOptions>({})

  protected readonly $visible = computed(() => {
    return this.confirmService.$current() !== null
  })
  protected readonly $options = computed(() => {
    return this.confirmService.$current() ?? this.$_last()
  })
  protected readonly $closable = computed(() => {
    return this.$options().closable ?? true
  })
  protected readonly $accept = computed(() => {
    return this.$options().acceptButtonProps ?? {}
  })
  protected readonly $reject = computed(() => {
    return this.$options().rejectButtonProps ?? {}
  })

  protected onAccept() {
    const options = this.settle()
    options?.accept?.()
  }

  protected onReject() {
    const options = this.settle()
    options?.reject?.()
  }

  protected onDismiss() {
    this.onReject()
  }

  private settle() {
    const options = this.confirmService.$current()
    if (options) {
      this.$_last.set(options)
    }
    this.confirmService.close()
    return options
  }
}
