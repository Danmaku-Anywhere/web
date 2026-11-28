import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
} from '@angular/core'
import { Badge, type BadgeSeverity } from './badge'

export type ButtonSeverity =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warn'
  | 'help'
  | 'danger'

export type ButtonVariant = 'solid' | 'text' | 'outlined'

export type ButtonSize = 'small' | 'medium' | 'large'

const SIZE_CLASSES: Record<ButtonSize, string | null> = {
  small: 'da-button-sm',
  medium: null,
  large: 'da-button-lg',
}

const VARIANT_CLASSES: Record<ButtonVariant, string | null> = {
  solid: null,
  text: 'da-button-text',
  outlined: 'da-button-outlined',
}

@Component({
  selector: 'button[daButton], a[daButton]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Badge],
  template: `
    <ng-content />
    @if (loading()) {
      <span class="da-button-icon pi pi-spinner pi-spin" aria-hidden="true"></span>
    } @else if (icon()) {
      <span [class]="'da-button-icon ' + icon()" aria-hidden="true"></span>
    }
    @if (label()) {
      <span class="da-button-label">{{ label() }}</span>
    }
    @if (badge()) {
      <da-badge [value]="badge()" [severity]="badgeSeverity()" />
    }
  `,
  host: {
    '[class]': '$classes()',
    '[attr.type]': '$isNativeButton ? type() : null',
    '[attr.disabled]': '$isNativeButton && $isDisabled() ? "" : null',
    '[attr.aria-disabled]': '!$isNativeButton && $isDisabled() ? "true" : null',
    '[attr.tabindex]': '!$isNativeButton && $isDisabled() ? "-1" : null',
  },
})
export class Button {
  protected readonly $isNativeButton =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName ===
    'BUTTON'

  severity = input<ButtonSeverity>('primary')
  variant = input<ButtonVariant>('solid')
  size = input<ButtonSize>('medium')
  rounded = input(false, { transform: booleanAttribute })
  label = input<string>()
  icon = input<string>()
  iconOnly = input(false, { transform: booleanAttribute })
  loading = input(false, { transform: booleanAttribute })
  disabled = input(false, { transform: booleanAttribute })
  badge = input<string>()
  badgeSeverity = input<BadgeSeverity>('primary')
  type = input<'button' | 'submit' | 'reset'>('button')

  protected readonly $isDisabled = computed(() => {
    return this.disabled() || this.loading()
  })

  protected readonly $classes = computed(() => {
    const hasIcon = !!this.icon() || this.iconOnly()
    const classes = [
      'da-button',
      `da-button-${this.severity()}`,
      VARIANT_CLASSES[this.variant()],
      SIZE_CLASSES[this.size()],
    ]
    if (this.rounded()) {
      classes.push('da-button-rounded')
    }
    if (hasIcon && !this.label() && !this.badge()) {
      classes.push('da-button-icon-only')
    }
    if (this.loading()) {
      classes.push('da-button-loading')
    }
    if (!this.$isNativeButton && this.$isDisabled()) {
      classes.push('da-button-disabled')
    }
    return classes.filter(Boolean).join(' ')
  })
}
