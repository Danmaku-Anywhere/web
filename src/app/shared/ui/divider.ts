import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  selector: 'da-divider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="da-divider-content"></div>`,
  host: {
    class: 'da-divider',
    role: 'separator',
    'aria-orientation': 'horizontal',
  },
})
export class Divider {}
