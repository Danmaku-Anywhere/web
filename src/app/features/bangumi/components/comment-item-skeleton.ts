import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component } from '@angular/core'
import { Skeleton } from '../../../shared/ui/skeleton'

@Component({
  selector: 'da-comment-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, Skeleton],
  template: `
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <da-skeleton shape="circle" size="2.5rem" />
          <div>
            <da-skeleton width="8rem" height="1rem" />
            <da-skeleton width="6rem" height="0.875rem" class="mt-1" />
          </div>
        </div>
        <div class="flex items-center gap-2">
          <da-skeleton width="6rem" height="1rem" />
        </div>
      </div>
      <da-skeleton width="100%" height="1rem" />
      <da-skeleton width="80%" height="1rem" />
    </div>
  `,
})
export class CommentItemSkeleton {}
