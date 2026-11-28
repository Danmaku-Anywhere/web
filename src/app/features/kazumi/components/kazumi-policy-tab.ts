import { NgClass } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core'
import type { KazumiPolicy } from '@danmaku-anywhere/extension-protocol'
import { injectQuery } from '@tanstack/angular-query'
import { TooltipModule } from 'primeng/tooltip'
import { Badge } from '../../../shared/ui/badge'
import { KazumiService } from '../services/kazumi.service'

@Component({
  selector: 'da-kazumi-policy-tab',
  imports: [NgClass, TooltipModule, Badge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex gap-1 items-center">
      <span>{{ policy().name }}</span>
      <da-badge
        [ngClass]="{
        'bg-yellow-600': searchQuery.isFetching(),
        'bg-green-600': searchQuery.isSuccess(),
        'bg-red-600': searchQuery.isError(),
        'bg-gray-600': !searchQuery.isEnabled()
        }"
      ></da-badge>
    </div>
  `,
})
export class KazumiPolicyTab {
  policy = input.required<KazumiPolicy>()
  keyword = input.required<string>()
  isActive = input(false)

  private kazumiService = inject(KazumiService)

  // same query as the search result
  protected searchQuery = injectQuery(() =>
    this.kazumiService.getSearchQueryOptions(this.keyword(), this.policy())
  )
}
