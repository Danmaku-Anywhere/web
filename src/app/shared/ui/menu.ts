import { type ConnectedPosition, OverlayModule } from '@angular/cdk/overlay'
import { NgTemplateOutlet } from '@angular/common'
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  contentChild,
  ElementRef,
  Injector,
  inject,
  input,
  output,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core'

export interface MenuItem {
  label: string
  command: () => void
}

const POSITIONS: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
  { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' },
  {
    originX: 'start',
    originY: 'top',
    overlayX: 'start',
    overlayY: 'bottom',
  },
  { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom' },
]

let nextId = 0

@Component({
  selector: 'da-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OverlayModule, NgTemplateOutlet],
  template: `
    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="$target() ?? host"
      [cdkConnectedOverlayOpen]="$target() !== null"
      [cdkConnectedOverlayPositions]="positions"
      [cdkConnectedOverlayDisableClose]="true"
      (overlayOutsideClick)="onOutsideClick($event)"
      (overlayKeydown)="onOverlayKeydown($event)"
      (detach)="close(false)"
    >
      <div class="da-menu" [id]="id">
        @if ($content(); as content) {
          <ng-container [ngTemplateOutlet]="content" />
        }
        <ul
          #list
          role="menu"
          class="da-menu-list"
          tabindex="0"
          [attr.aria-activedescendant]="$focused() >= 0 ? itemId($focused()) : null"
          (keydown)="onListKeydown($event)"
          (blur)="$focused.set(-1)"
        >
          @for (item of items(); track $index) {
            <li
              role="menuitem"
              class="da-menu-item"
              [id]="itemId($index)"
              [attr.aria-label]="item.label"
              [class.da-menu-item-focused]="$index === $focused()"
              (click)="run(item)"
            >
              <div class="da-menu-item-content">
                <span class="da-menu-item-label">{{ item.label }}</span>
              </div>
            </li>
          }
        </ul>
      </div>
    </ng-template>
  `,
})
export class Menu {
  private readonly injector = inject(Injector)
  protected readonly host: HTMLElement = inject(ElementRef).nativeElement

  items = input<MenuItem[]>([])
  hidden = output<void>()

  readonly id = `da-menu-${nextId++}`
  protected readonly positions = POSITIONS
  protected readonly $target = signal<HTMLElement | null>(null)
  protected readonly $focused = signal(-1)
  private readonly $list = viewChild<ElementRef<HTMLElement>>('list')
  protected readonly $content = contentChild(TemplateRef)

  get visible() {
    return this.$target() !== null
  }

  toggle(event: Event) {
    if (this.visible) {
      this.hide()
      return
    }
    this.$target.set(event.currentTarget as HTMLElement)
    if (this.items().length > 0) {
      afterNextRender(() => this.$list()?.nativeElement.focus(), {
        injector: this.injector,
      })
    }
  }

  hide() {
    this.close(true)
  }

  protected close(refocus: boolean) {
    const target = this.$target()
    if (!target) {
      return
    }
    this.$target.set(null)
    this.$focused.set(-1)
    if (refocus) {
      target.focus()
    }
    this.hidden.emit()
  }

  protected itemId(index: number) {
    return `${this.id}-${index}`
  }

  protected run(item: MenuItem) {
    item.command()
    this.hide()
  }

  protected onOutsideClick(event: MouseEvent) {
    if (!this.$target()?.contains(event.target as Node)) {
      this.close(false)
    }
  }

  protected onOverlayKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.stopPropagation()
      this.hide()
    }
  }

  protected onListKeydown(event: KeyboardEvent) {
    const last = this.items().length - 1
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        this.$focused.update((i) => Math.min(last, i + 1))
        return
      case 'ArrowUp':
        event.preventDefault()
        this.$focused.update((i) => Math.max(0, i - 1))
        return
      case 'Home':
      case 'End':
        event.preventDefault()
        this.$focused.set(event.key === 'Home' ? 0 : last)
        return
      case 'Enter':
      case ' ': {
        event.preventDefault()
        const item = this.items()[this.$focused()]
        if (item) {
          this.run(item)
        }
        return
      }
      case 'Tab':
        this.close(false)
    }
  }
}
