import { CommonModule, NgOptimizedImage } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core'
import { RouterLink } from '@angular/router'
import { MaterialIcon } from '../../../../../shared/components/material-icon'
import { RatingDistributionComponent } from '../../../../../shared/components/rating-distribution.component'
import { ImageFallback } from '../../../../../shared/images/image-fallback.directive'
import { Button } from '../../../../../shared/ui/button'
import { Tag } from '../../../../../shared/ui/tag'
import type { BgmSubject } from '../../../types/bangumi.types'
import { BangumiImageSourcePipe } from '../../../utils/bangumi-image-source.pipe'

@Component({
  selector: 'da-subject-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    Button,
    Tag,
    MaterialIcon,
    RatingDistributionComponent,
    NgOptimizedImage,
    ImageFallback,
    BangumiImageSourcePipe,
  ],
  template: `
    @let subjectData = subject();
    <div class="mb-6">
      <div class="flex flex-col lg:flex-row gap-6">
        <div class="relative flex-shrink-0 w-48 lg:w-56 aspect-[2/3] overflow-hidden rounded-lg shadow-lg">
          <img
            [ngSrc]="subjectData.images | bangumiImageSource: 'cover'"
            fill
            ngSrcset="200w, 400w, 800w"
            sizes="(min-width: 1024px) 224px, 192px"
            priority
            [alt]="subjectData.name"
            class="object-cover"
            daFallback="cover"
          />
        </div>

        <div class="flex-1 space-y-4">
          <div class="flex justify-between items-start">
            <div>
              <div class="flex items-baseline gap-4">
                <h1 class="text-2xl lg:text-3xl font-bold mb-1">
                  {{ subjectData.nameCN || subjectData.name }}
                </h1>
                @if (subjectData.rating.rank) {
                  <span class="text-gray-500">
                    #{{ subjectData.rating.rank }}
                  </span>
                }
              </div>
              @if (subjectData.nameCN && subjectData.name !== subjectData.nameCN) {
                <p class="text-lg lg:text-xl text-gray-600">
                  {{ subjectData.name }}
                </p>
              }
            </div>
            <div class="flex flex-col self-stretch">
              <div class="flex items-center gap-2">
                <span class="text-2xl font-bold text-primary">
                  {{ subjectData.rating.score.toFixed(1) }}
                </span>
                <span class="text-gray-500 text-sm">
                  ({{ subjectData.rating.total }}人评分)
                </span>
              </div>
              <div class="grow min-h-6">
                <da-rating-distribution
                  [ratingCounts]="subjectData.rating.count"
                  [total]="subjectData.rating.total"
                />
              </div>
            </div>
          </div>



          @if (subjectData.collection) {
            <div class="flex flex-wrap gap-3 text-sm">
              @if (subjectData.collection[2]) {
                <span class="text-gray-600">
                  收藏: {{ subjectData.collection[2] }}
                </span>
              }
              @if (subjectData.collection[3]) {
                <span class="text-gray-600">
                  在看: {{ subjectData.collection[3] }}
                </span>
              }
              @if (subjectData.collection[1]) {
                <span class="text-gray-600">
                  想看: {{ subjectData.collection[1] }}
                </span>
              }
            </div>
          }

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
            <div class="space-y-2">
              @if (subjectData.airtime.date) {
                <p><strong>放送日期:</strong> {{ subjectData.airtime.date }}</p>
              }
              @if (subjectData.eps) {
                <p><strong>话数:</strong> {{ subjectData.eps }}</p>
              }
              @if (subjectData.volumes) {
                <p><strong>卷数:</strong> {{ subjectData.volumes }}</p>
              }
              @if (subjectData.platform.typeCN) {
                <p><strong>平台:</strong> {{ subjectData.platform.typeCN }}</p>
              }
            </div>
          </div>

          @if (subjectData.tags && subjectData.tags.length > 0) {
            <div class="space-y-2">
              <div class="flex items-center gap-4 text-gray-500">
                <h3 class="text-sm font-semibold ">标签</h3>
                @if (subjectData.tags.length > 8) {
                  <button
                    (click)="toggleTagsExpanded()"
                    class="text-sm cursor-pointer hover:underline"
                  >
                    {{ tagsExpanded() ? '收起' : '展开 (' + subjectData.tags.length + ')' }}
                  </button>
                }
              </div>
              <div class="flex flex-wrap gap-2">
                @for (tag of getDisplayedTags(); track tag.name) {
                  <da-tag
                    severity="info"
                    class="text-xs"
                  >
                    <span class="mr-1">{{ tag.name }}</span>
                    <span class="text-gray-500">{{ tag.count }}</span>
                  </da-tag>
                }
              </div>
            </div>
          }

          <div class="flex items-start gap-3 pt-2">
            <button
              daButton
              [routerLink]="['/kazumi/search']"
              [queryParams]="{ q: subjectData.nameCN || subjectData.name, id: subjectData.id, type: 'bangumi' }"
              label="立即观看"
              severity="primary"
              size="large"
            >
              <da-mat-icon size="lg" icon="play_arrow" class="mr-2" />
            </button>
            <button
              daButton
              label="返回"
              severity="secondary"
              size="large"
              routerLink="/trending"
            ></button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SubjectHeader {
  subject = input.required<BgmSubject>()
  protected tagsExpanded = signal(false)

  protected toggleTagsExpanded() {
    this.tagsExpanded.update((expanded) => !expanded)
  }

  protected getDisplayedTags() {
    const tags = this.subject().tags || []
    return this.tagsExpanded() ? tags : tags.slice(0, 8)
  }
}
