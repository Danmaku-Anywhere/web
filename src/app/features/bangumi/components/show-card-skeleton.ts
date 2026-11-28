import { CommonModule } from '@angular/common'
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core'
import { Card } from '../../../shared/ui/card'
import { Skeleton } from '../../../shared/ui/skeleton'

@Component({
  selector: 'da-show-card-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, Card, Skeleton],
  template: `
    <da-card class="overflow-hidden">
      <div daCardHeader class="relative aspect-square md:aspect-[2/3]">
        <da-skeleton width="100%" height="100%" />
      </div>

      <div class="flex flex-col">
        <da-skeleton width="80%" height="24px" />
        @if (!hideAltTitle()) {
          <da-skeleton width="60%" height="16px" class="mt-2" />
        }
      </div>

      @if (!hideFooter()) {
        <div daCardFooter class="flex justify-between">
          <da-skeleton width="60px" height="32px" />
          <da-skeleton width="60px" height="32px" />
        </div>
      }
    </da-card>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }
  `,
})
export class ShowCardSkeleton {
  hideAltTitle = input(false, { transform: booleanAttribute })
  hideFooter = input(false, { transform: booleanAttribute })
}
