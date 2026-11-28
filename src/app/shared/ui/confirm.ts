import {
  ChangeDetectionStrategy,
  Component,
  Injectable,
  inject,
  linkedSignal,
  signal,
} from '@angular/core'
import { Button, type ButtonSeverity } from './button'
import { Dialog, DialogFooter } from './dialog'

export interface ConfirmButtonProps {
  label: string
  severity: ButtonSeverity
}

export interface ConfirmOptions {
  header: string
  message: string
  acceptButtonProps: ConfirmButtonProps
  rejectButtonProps: ConfirmButtonProps
  accept: () => void
  reject: () => void
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
    @let options = $options();
    <da-dialog
      [role]="'alertdialog'"
      panelClass="da-confirm-dialog"
      [visible]="confirmService.$current() !== null"
      [header]="options?.header"
      [closable]="false"
      [closeOnEscape]="false"
    >
      <span class="da-confirm-dialog-message">{{ options?.message }}</span>
      <ng-container daDialogFooter>
        <button
          daButton
          [severity]="options?.rejectButtonProps?.severity ?? 'secondary'"
          (click)="settle('reject')"
        >
          {{ options?.rejectButtonProps?.label }}
        </button>
        <button
          daButton
          [severity]="options?.acceptButtonProps?.severity ?? 'primary'"
          (click)="settle('accept')"
        >
          {{ options?.acceptButtonProps?.label }}
        </button>
      </ng-container>
    </da-dialog>
  `,
})
export class ConfirmDialog {
  protected readonly confirmService = inject(ConfirmService)

  // Keeps the text on screen while the dialog plays its leave animation.
  protected readonly $options = linkedSignal<
    ConfirmOptions | null,
    ConfirmOptions | null
  >({
    source: this.confirmService.$current,
    computation: (current, previous) => {
      return current ?? previous?.value ?? null
    },
  })

  protected settle(choice: 'accept' | 'reject') {
    const options = this.confirmService.$current()
    this.confirmService.close()
    options?.[choice]()
  }
}
