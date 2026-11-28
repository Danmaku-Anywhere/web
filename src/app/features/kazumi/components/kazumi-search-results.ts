import { JsonPipe } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core'
import {
  isXPathPolicy,
  type KazumiPolicy,
} from '@danmaku-anywhere/extension-protocol'
import { injectQuery } from '@tanstack/angular-query'
import { MaterialIcon } from '../../../shared/components/material-icon'
import { UnescapePipePipe } from '../../../shared/pipes/UrlDecodePipe'
import { Button } from '../../../shared/ui/button'
import { Divider } from '../../../shared/ui/divider'
import { Skeleton } from '../../../shared/ui/skeleton'
import { KazumiService } from '../services/kazumi.service'

@Component({
  selector: 'da-kazumi-search-results',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Divider,
    JsonPipe,
    Button,
    Skeleton,
    MaterialIcon,
    UnescapePipePipe,
  ],
  template: `
    <div>
      @if (!$isRunnable()) {
        <p class="p-4">该规则使用 API 模式，当前版本暂不支持搜索</p>
      }

      @if (searchQuery.isFetching()) {
        @for (i of [1, 2, 3]; track i) {
          <da-skeleton class="my-2" width="100%" height="76px" />
        }
      }

      @if (searchQuery.isError()) {
        <div>
          <p>
            搜索错误
          </p>
          <p>
            {{ searchQuery.error() | json }}
          </p>
          <button daButton (click)="searchQuery.refetch()" label="重试"></button>
        </div>
      }

      @if (searchQuery.data(); as results) {
        <div>
          @if (results.length === 0) {
            <p class="p-4">无结果，请尝试其他规则</p>
          } @else {
            @for (item of results; track item.url) {
              <div class="relative">
                <div
                  role="button"
                  class="rounded p-4 cursor-pointer dark:bg-surface-900 dark:hover:bg-surface-800 transition-[background]"
                  (click)="itemClick.emit(item)"
                >
                  <h4 class="font-medium">{{ item.name | unescape }}</h4>
                  <p class="text-sm text-gray-500 overflow-hidden overflow-ellipsis">{{ item.url }}</p>
                </div>
                <a class="absolute right-0 top-0"
                   [href]="item.url" daButton variant="text" rounded severity="secondary" target="_blank" rel="noreferrer"
                >
                  <da-mat-icon icon="open_in_new" size="xl" />
                </a>
              </div>
              @if (!$last) {
                <da-divider class="m-1" />
              }
            }
          }
        </div>
      }
    </div>
  `,
})
export class SearchResultsComponent {
  policy = input.required<KazumiPolicy>()
  keyword = input('')
  itemClick = output<{ name: string; url: string }>()

  private kazumiService = inject(KazumiService)

  protected $isRunnable = computed(() => isXPathPolicy(this.policy()))

  protected searchQuery = injectQuery(() =>
    this.kazumiService.getSearchQueryOptions(this.keyword(), this.policy())
  )
}
