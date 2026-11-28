import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  selector: 'da-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-content select="[daCardHeader]" />
    <div class="da-card-body">
      <div class="da-card-content">
        <ng-content />
      </div>
      <ng-content select="[daCardFooter]" />
    </div>
  `,
  host: {
    class: 'da-card',
  },
})
export class Card {}
