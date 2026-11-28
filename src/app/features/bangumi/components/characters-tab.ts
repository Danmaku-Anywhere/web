import { CommonModule, NgOptimizedImage } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core'
import { injectQuery } from '@tanstack/angular-query'
import { ImageFallback } from '../../../shared/images/image-fallback.directive'
import { Card } from '../../../shared/ui/card'
import { Spinner } from '../../../shared/ui/spinner'
import { BangumiService } from '../services/bangumi.service'
import { BangumiImageSourcePipe } from '../utils/bangumi-image-source.pipe'

@Component({
  selector: 'da-characters-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    Spinner,
    Card,
    NgOptimizedImage,
    ImageFallback,
    BangumiImageSourcePipe,
  ],
  template: `
    @if (charactersQuery.isPending()) {
      <div class="flex justify-center py-8">
        <da-spinner />
      </div>
    } @else if (charactersQuery.isSuccess()) {
      @let response = charactersQuery.data();
      @if (response?.data && response.data.length > 0) {
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          @for (character of response.data; track character.character.id) {
            <div class="flex gap-4">
              @let photo = character.character.images | bangumiImageSource;
              @if (photo) {
                <div class="relative w-16 h-16 shrink-0 overflow-hidden rounded">
                  <img
                    [ngSrc]="photo"
                    fill
                    ngSrcset="100w, 200w"
                    sizes="64px"
                    [alt]="character.character.name"
                    class="object-cover object-top"
                    daFallback
                  />
                </div>
              } @else {
                <div class="w-16 h-16 shrink-0 bg-surface-800 rounded"></div>
              }
              <div class="flex-1">
                <h4 class="font-semibold">{{ character.character.nameCN || character.character.name }}</h4>
                @if (character.character.nameCN && character.character.name !== character.character.nameCN) {
                  <p class="text-sm text-gray-600">{{ character.character.name }}</p>
                }
                @if (character.actors && character.actors.length > 0) {
                  <p class="text-sm text-gray-500 mt-1">
                    声优: {{ character.actors[0].nameCN || character.actors[0].name }}
                  </p>
                }
              </div>
            </div>
          }
        </div>
      } @else {
        <da-card>
          <p class="text-gray-500">暂无角色信息</p>
        </da-card>
      }
    } @else {
      <da-card>
        <p class="text-red-500">加载角色信息失败</p>
      </da-card>
    }
  `,
})
export class CharactersTab {
  subjectId = input.required<number>()
  visited = input<boolean>(false)

  private bangumiService = inject(BangumiService)

  private queryOptions = computed(() => {
    if (!this.visited()) {
      return { enabled: false, queryKey: ['characters', this.subjectId()] }
    }
    return this.bangumiService.getSubjectCharactersQueryOptions(
      this.subjectId()
    )
  })

  protected charactersQuery = injectQuery(this.queryOptions)
}
