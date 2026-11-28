import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core'

export type BadgeSeverity =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warn'
  | 'danger'

@Component({
  selector: 'da-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '{{ value() }}',
  host: {
    '[class]': '$classes()',
  },
})
export class Badge {
  value = input<string | number>()
  severity = input<BadgeSeverity>('primary')

  protected readonly $classes = computed(() => {
    const text = String(this.value() ?? '')
    const classes = ['da-badge', `da-badge-${this.severity()}`]
    if (text.length === 0) {
      classes.push('da-badge-dot')
    } else if (text.length === 1) {
      classes.push('da-badge-circle')
    }
    return classes.join(' ')
  })
}
