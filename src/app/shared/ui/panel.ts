import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  linkedSignal,
} from '@angular/core'
import { Button } from './button'

let nextPanelId = 0

@Component({
  selector: 'da-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button],
  template: `
    <div class="da-panel-header" (click)="onHeaderClick()">
      @if (header()) {
        <span class="da-panel-title">{{ header() }}</span>
      }
      <ng-content select="[daPanelHeader]" />
      <div class="da-panel-header-actions">
        @if (toggleable()) {
          <button
            daButton
            severity="secondary"
            variant="text"
            rounded
            iconOnly
            [attr.aria-controls]="contentId"
            [attr.aria-expanded]="!$collapsed()"
            (click)="onToggleButtonClick()"
          >
            <span [class]="$collapsed() ? 'pi pi-plus' : 'pi pi-minus'" aria-hidden="true"></span>
          </button>
        }
      </div>
    </div>
    <div
      class="da-panel-content-container"
      role="region"
      [id]="contentId"
      [attr.aria-hidden]="toggleable() && $collapsed()"
      [inert]="toggleable() && $collapsed()"
    >
      <div class="da-panel-content-wrapper">
        <div class="da-panel-content">
          <ng-content />
        </div>
      </div>
    </div>
  `,
  host: {
    class: 'da-panel',
    '[class.da-panel-toggleable]': 'toggleable()',
    '[class.da-panel-collapsed]': 'toggleable() && $collapsed()',
  },
})
export class Panel {
  header = input<string>()
  toggleable = input(false, { transform: booleanAttribute })
  collapsed = input(false, { transform: booleanAttribute })
  toggler = input<'icon' | 'header'>('icon')

  protected readonly contentId = `da-panel-${nextPanelId++}`
  protected readonly $collapsed = linkedSignal(() => this.collapsed())

  protected onHeaderClick() {
    if (this.toggleable() && this.toggler() === 'header') {
      this.toggle()
    }
  }

  protected onToggleButtonClick() {
    if (this.toggler() === 'icon') {
      this.toggle()
    }
  }

  private toggle() {
    this.$collapsed.update((collapsed) => !collapsed)
  }
}
