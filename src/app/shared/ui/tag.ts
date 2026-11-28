import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core'

export type TagSeverity =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warn'
  | 'danger'

@Component({
  selector: 'da-tag',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-content />
    <span class="da-tag-label">{{ value() }}</span>
  `,
  host: {
    '[class]': '$classes()',
  },
})
export class Tag {
  value = input<string>()
  severity = input<TagSeverity>('primary')

  protected readonly $classes = computed(() => {
    return `da-tag da-tag-${this.severity()}`
  })
}
