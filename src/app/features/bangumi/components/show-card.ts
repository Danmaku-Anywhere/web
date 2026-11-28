import { CommonModule, NgOptimizedImage } from '@angular/common'
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core'
import { Router, RouterLink } from '@angular/router'
import { TrackingService } from '../../../core/tracking.service'
import { MaterialIcon } from '../../../shared/components/material-icon'
import { ImageFallback } from '../../../shared/images/image-fallback.directive'
import { Button } from '../../../shared/ui/button'
import { Card } from '../../../shared/ui/card'
import { Tag } from '../../../shared/ui/tag'

export interface ShowCardData {
  id: number
  altTitle: string
  title?: string
  air_date?: string
  eps?: number
  eps_count?: number
  rating?: {
    score?: number
    total?: number
  }
  rank?: number
  cover: string
}

@Component({
  selector: 'da-show-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    Card,
    Button,
    Tag,
    MaterialIcon,
    NgOptimizedImage,
    ImageFallback,
  ],
  template: `
    <da-card class="overflow-hidden">
      @let showData = show();
      <div daCardHeader class="relative aspect-[17/24] contain-strict overflow-hidden">
        <img
          [ngSrc]="showData.cover"
          fill
          ngSrcset="200w, 400w, 800w"
          sizes="(max-width: 767px) 50vw, 240px"
          [alt]="showData.altTitle"
          daFallback="cover"
          class="object-cover cursor-pointer hover:opacity-80 transition-opacity"
          (click)="navigateToDetails(showData.id, 'image')" />
        @if (showData.rating?.score !== undefined) {
          <div class="absolute top-2 right-2">
            <da-tag
              [value]="showData.rating!.score!.toFixed(1)"
              severity="secondary"
              class="font-bold"
            />
          </div>
        }
        @if (showData.rank && showData.rank > 0) {
          <div class="absolute top-2 left-2">
            <da-tag
              [value]="'#' + showData.rank"
              severity="info"
              class="font-bold bg-cyan-950"
            />
          </div>
        }
      </div>

      <div class="space-y-1">
        <h3
          class="text-lg font-semibold overflow-hidden text-nowrap text-ellipsis cursor-pointer hover:underline"
          (click)="navigateToDetails(showData.id, 'title')"
          [title]="showData.title">
          {{ showData.title }}
        </h3>
        @if (!hideAltTitle() && showData.title && showData.altTitle !== showData.title) {
          <p class="text-sm text-gray-600 overflow-hidden text-nowrap text-ellipsis">
            {{ showData.altTitle }}
          </p>
        }
      </div>

      @if (!hideFooter()) {
        <div daCardFooter class="flex justify-between">
          <button
            daButton
            (click)="navigateToDetails(showData.id, 'detailsButton')"
            label="详情"
            severity="secondary"
            size="small"
          ></button>
          <button
            daButton
            [routerLink]="['/kazumi/search']"
            [queryParams]="{ q: showData.title || showData.altTitle, id: showData.id, type: 'bangumi' }"
            label="观看"
            severity="primary"
            size="small"
            (click)="onWatchClick(showData)"
          >
            <da-mat-icon size="sm" icon="play_arrow" />
          </button>
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
export class ShowCard {
  readonly show = input.required<ShowCardData>()
  readonly hideAltTitle = input(false, { transform: booleanAttribute })
  readonly hideFooter = input(false, { transform: booleanAttribute })

  private router = inject(Router)
  private trackingService = inject(TrackingService)

  navigateToDetails(id: number, source: string): void {
    this.trackingService.track('clickShowCard', { id, source })
    void this.router.navigate(['/details', id])
  }

  onWatchClick(showData: ShowCardData): void {
    this.trackingService.track('clickShowCardWatch', { showData })
  }
}
