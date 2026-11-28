import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core'
import { Button } from '../../../shared/ui/button'
import { Tag } from '../../../shared/ui/tag'
import { SearchListItem } from '../search-list-item.component'
import type { SearchHistoryEntry } from '../search-model.type'

@Component({
  selector: 'da-search-history-entry',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SearchListItem, Tag, Button],
  template: `
    <da-search-list-item (select)="handleClick()">
      @let item = entry();
      <div class="flex items-center gap-3 min-h-10">
        <da-tag
          severity="secondary"
          class="text-xs"
        >
          {{ item.provider }}
        </da-tag>
        @if (item.term) {
          <span class="flex-1 truncate">{{ item.term }}</span>
        } @else {
          <span class="flex-1 truncate text-gray-500">无搜索词</span>
        }
        <ng-template #actions>
          <button
            daButton
            class="absolute right-4 top-1/2 -translate-y-1/2"
            variant="text"
            severity="secondary"
            size="small"
            icon="pi pi-times"
            (click)="handleRemove()"
          ></button>
        </ng-template>
      </div>
    </da-search-list-item>
  `,
})
export class SearchHistoryEntryComponent {
  entry = input.required<SearchHistoryEntry>()

  select = output<SearchHistoryEntry>()
  remove = output<SearchHistoryEntry>()

  handleClick() {
    this.select.emit(this.entry())
  }

  handleRemove() {
    this.remove.emit(this.entry())
  }
}
