import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import type {
  CustomEpisodeLite,
  EpisodeLite,
  GenericEpisodeLite,
} from '@danmaku-anywhere/danmaku-model'
import { Popover } from 'primeng/popover'
import { MaterialIcon } from '../../../shared/components/material-icon'
import { Button } from '../../../shared/ui/button'
import { DanmakuService } from '../../danmaku/danmaku.service'
import { episodeSourceLabel } from '../episode-source-label'

@Component({
  selector: 'da-video-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, MaterialIcon, Popover],
  template: `
    <div
      class="flex flex-wrap items-center justify-between gap-2 p-3 rounded-md border border-content-border bg-content text-foreground"
      role="toolbar"
    >
      <div class="flex items-center">
        <button
          daButton
          (click)="episodePanel.toggle($event)"
          severity="secondary"
          variant="text"
          iconOnly
        >
          <da-mat-icon icon="format_list_bulleted" />
        </button>
      </div>
    </div>

    <p-popover #episodePanel [style]="{ width: '400px', maxHeight: '500px' }">
      <ng-template #content>
        <div>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-lg">以下载弹幕</h3>
            <button
              daButton
              (click)="episodePanel.hide()"
              severity="secondary"
              variant="text"
              iconOnly
            >
              <da-mat-icon icon="close" />
            </button>
          </div>

          @if (danmakuService.episodesQuery.isSuccess()) {
            @let data = danmakuService.episodesQuery.data();

            <div class="h-[400px] overflow-auto da-scrollbar">
              @if (data.length === 0) {
                <div class="flex flex-col items-center justify-center p-6">
                  <i class="pi pi-inbox text-2xl text-gray-400 mb-2"></i>
                  <span class="text-gray-500">无弹幕</span>
                </div>
              } @else {
                <div class="flex flex-col gap-2">
                  @for (episode of data; track episode.id) {
                    <div
                      class="p-3 rounded-lg cursor-pointer"
                      (click)="onEpisodeClick(episode)"
                    >
                      <div class="flex items-start justify-between">
                        <div class="flex-1 min-w-0">
                          <h4 class="font-medium text-sm truncate mb-1">{{ episode.title }}</h4>
                          <div class="flex items-center gap-2 text-xs text-gray-500">
                            <span class="px-2 py-1 rounded text-xs">{{ source(episode) }}</span>

                            @if (episode.commentCount > 0) {
                              <span class="flex items-center gap-1">
                                <i class="pi pi-comments"></i>
                                {{ episode.commentCount }}
                              </span>
                            }
                          </div>
                        </div>
                        <i class="pi pi-angle-right text-gray-400 ml-2"></i>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>
      </ng-template>
    </p-popover>
  `,
})
export class VideoToolbar {
  readonly danmakuService = inject(DanmakuService)

  onEpisodeClick(episode: EpisodeLite | CustomEpisodeLite) {
    // noop
  }

  protected source(episode: GenericEpisodeLite): string {
    return episodeSourceLabel(episode)
  }
}
