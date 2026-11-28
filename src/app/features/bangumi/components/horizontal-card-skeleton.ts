import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component } from '@angular/core'
import { Card } from '../../../shared/ui/card'
import { Skeleton } from '../../../shared/ui/skeleton'

@Component({
  selector: 'da-horizontal-card-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, Card, Skeleton],
  template: `
    <da-card>
      <div class="flex gap-4">
        <da-skeleton width="80px" height="112px" />
        <div class="flex-1 space-y-2">
          <div class="flex items-center gap-2">
            <da-skeleton width="80px" height="20px" />
            <da-skeleton width="60px" height="20px" />
          </div>
          <da-skeleton width="70%" height="24px" />
          <da-skeleton width="50%" height="16px" />
          <da-skeleton width="40%" height="16px" />
        </div>
      </div>
    </da-card>
  `,
})
export class HorizontalCardSkeleton {}
