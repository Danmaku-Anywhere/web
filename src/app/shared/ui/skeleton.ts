import { ChangeDetectionStrategy, Component, input } from '@angular/core'

@Component({
  selector: 'da-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
  host: {
    class: 'da-skeleton',
    'aria-hidden': 'true',
    '[class.da-skeleton-circle]': 'shape() === "circle"',
    '[style.width]': 'size() ?? width()',
    '[style.height]': 'size() ?? height()',
  },
})
export class Skeleton {
  width = input('100%')
  height = input('1rem')
  size = input<string>()
  shape = input<'rectangle' | 'circle'>('rectangle')
}
