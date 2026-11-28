import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  selector: 'da-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg class="da-spinner-svg" viewBox="25 25 50 50">
      <circle
        class="da-spinner-circle"
        cx="50"
        cy="50"
        r="20"
        fill="none"
        stroke-width="2"
        stroke-miterlimit="10"
      />
    </svg>
  `,
  host: {
    class: 'da-spinner',
    role: 'progressbar',
    'aria-busy': 'true',
  },
})
export class Spinner {}
