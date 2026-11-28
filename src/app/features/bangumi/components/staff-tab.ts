import { CommonModule, NgOptimizedImage } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core'
import { injectQuery } from '@tanstack/angular-query'
import { ImageFallback } from '../../../shared/images/image-fallback.directive'
import { Card } from '../../../shared/ui/card'
import { Spinner } from '../../../shared/ui/spinner'
import { Tag } from '../../../shared/ui/tag'
import { BangumiService } from '../services/bangumi.service'
import { BangumiImageSourcePipe } from '../utils/bangumi-image-source.pipe'

@Component({
  selector: 'da-staff-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    Spinner,
    Card,
    Tag,
    NgOptimizedImage,
    ImageFallback,
    BangumiImageSourcePipe,
  ],
  template: `
    @if (staffQuery.isPending()) {
      <div class="flex justify-center py-8">
        <da-spinner />
      </div>
    } @else if (staffQuery.isSuccess()) {
      @let response = staffQuery.data();
      @if (response?.data && response.data.length > 0) {
        <div class="grid grid-cols-2 gap-4">
          @for (staffMember of response.data; track staffMember.staff.id) {
            <div class="flex gap-4">
              @let photo = staffMember.staff.images | bangumiImageSource;
              @if (photo) {
                <div class="relative w-24 h-24 shrink-0 overflow-hidden rounded">
                  <img
                    [ngSrc]="photo"
                    fill
                    ngSrcset="100w, 200w"
                    sizes="96px"
                    [alt]="staffMember.staff.name"
                    class="object-cover object-top"
                    daFallback
                  />
                </div>
              } @else {
                <div class="w-24 h-24 bg-surface-800 rounded"></div>
              }
              <div class="flex-1">
                <h4 class="font-semibold">{{ staffMember.staff.nameCN || staffMember.staff.name }}</h4>
                @if (staffMember.staff.nameCN && staffMember.staff.name !== staffMember.staff.nameCN) {
                  <p class="text-sm text-gray-600">{{ staffMember.staff.name }}</p>
                }
                @if (staffMember.positions && staffMember.positions.length > 0) {
                  <div class="mt-2 flex gap-2 flex-wrap">
                    @for (position of staffMember.positions; track position.type.id) {
                      <da-tag
                        [value]="position.type.cn"
                        severity="info"
                        class="bg-blue-100 text-blue-800 text-xs font-normal"
                      />
                    }
                  </div>
                }
              </div>
            </div>
          }
        </div>
      } @else {
        <da-card>
          <p class="text-gray-500">暂无制作人员信息</p>
        </da-card>
      }
    } @else {
      <da-card>
        <p class="text-red-500">加载制作人员信息失败</p>
      </da-card>
    }
  `,
})
export class StaffTab {
  subjectId = input.required<number>()
  visited = input<boolean>(false)

  private bangumiService = inject(BangumiService)

  protected staffQuery = injectQuery(() => {
    return {
      ...this.bangumiService.getSubjectStaffPersonsQueryOptions(
        this.subjectId()
      ),
      enabled: this.visited(),
    }
  })
}
