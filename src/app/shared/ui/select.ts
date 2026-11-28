import { type ConnectedPosition, OverlayModule } from '@angular/cdk/overlay'
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  forwardRef,
  Injector,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core'
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { Icon } from './icon'

// Shift the list 1px in and 1px away from the trigger so its edge lines up
// with the inside of the trigger's border.
const POSITIONS: ConnectedPosition[] = [
  {
    originX: 'start',
    originY: 'bottom',
    overlayX: 'start',
    overlayY: 'top',
    offsetX: 1,
    offsetY: 1,
  },
  {
    originX: 'start',
    originY: 'top',
    overlayX: 'start',
    overlayY: 'bottom',
    offsetX: 1,
    offsetY: -1,
  },
]

let nextId = 0

@Component({
  selector: 'da-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OverlayModule, Icon],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Select),
      multi: true,
    },
  ],
  template: `
    <span
      #trigger
      role="combobox"
      class="da-select-label"
      tabindex="0"
      aria-haspopup="listbox"
      [class.da-select-placeholder]="$selectedIndex() < 0"
      [attr.aria-label]="$selectedIndex() < 0 ? placeholder() : $selectedLabel()"
      [attr.aria-expanded]="$open()"
      [attr.aria-controls]="$open() ? listId : null"
      [attr.aria-activedescendant]="$open() && $focused() >= 0 ? optionId($focused()) : null"
      (click)="toggle()"
      (keydown)="onKeydown($event)"
      (blur)="onTouched?.()"
    >{{ $selectedIndex() < 0 ? placeholder() : $selectedLabel() }}</span>
    <div class="da-select-dropdown" aria-hidden="true" (click)="toggle()">
      <svg class="da-select-dropdown-icon" daIcon="chevron-down"></svg>
    </div>
    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="host"
      [cdkConnectedOverlayOpen]="$open()"
      [cdkConnectedOverlayPositions]="positions"
      [cdkConnectedOverlayMinWidth]="host.offsetWidth"
      [cdkConnectedOverlayDisableClose]="true"
      (overlayOutsideClick)="onOutsideClick($event)"
      (detach)="$open.set(false)"
    >
      <div class="da-select-overlay">
        <div class="da-select-list-container">
        <ul role="listbox" class="da-select-list" aria-label="Option List" [id]="listId">
          @for (option of options(); track $index) {
            <li
              role="option"
              class="da-select-option"
              [id]="optionId($index)"
              [class.da-select-option-selected]="$index === $selectedIndex()"
              [class.da-select-option-focused]="$index === $focused()"
              [attr.aria-label]="labelOf(option)"
              [attr.aria-selected]="$index === $selectedIndex()"
              [attr.aria-setsize]="options().length"
              [attr.aria-posinset]="$index + 1"
              (click)="choose($index)"
              (mousemove)="$focused.set($index)"
            >
              <span>{{ labelOf(option) }}</span>
            </li>
          }
        </ul>
        </div>
      </div>
    </ng-template>
  `,
  host: {
    class: 'da-select',
    '[class.da-select-sm]': 'size() === "small"',
    '[class.da-select-open]': '$open()',
  },
})
export class Select implements ControlValueAccessor {
  options = input.required<readonly object[]>()
  optionLabel = input.required<string>()
  optionValue = input<string>()
  placeholder = input<string>()
  size = input<'small'>()

  protected readonly listId = `da-select-${nextId++}-list`
  protected readonly positions = POSITIONS
  protected readonly host: HTMLElement = inject(ElementRef).nativeElement
  private readonly injector = inject(Injector)

  protected readonly $open = signal(false)
  protected readonly $focused = signal(-1)
  private readonly $value = signal<unknown>(undefined)
  private readonly $trigger =
    viewChild.required<ElementRef<HTMLElement>>('trigger')

  protected readonly $selectedIndex = computed(() => {
    const value = this.$value()
    return this.options().findIndex((option) => {
      return this.valueOf(option) === value
    })
  })
  protected readonly $selectedLabel = computed(() => {
    const option = this.options()[this.$selectedIndex()]
    return option ? this.labelOf(option) : ''
  })

  private onChange?: (value: unknown) => void
  protected onTouched?: () => void
  private typed = ''
  private typedAt = 0

  writeValue(value: unknown) {
    this.$value.set(value)
  }

  registerOnChange(fn: (value: unknown) => void) {
    this.onChange = fn
  }

  registerOnTouched(fn: () => void) {
    this.onTouched = fn
  }

  protected optionId(index: number) {
    return `${this.listId}-${index}`
  }

  protected labelOf(option: object) {
    return String(this.read(option, this.optionLabel()))
  }

  protected toggle() {
    if (this.$open()) {
      this.close()
    } else {
      this.open()
    }
  }

  protected choose(index: number) {
    const option = this.options()[index]
    if (!option) {
      return
    }
    const value = this.valueOf(option)
    if (value !== this.$value()) {
      this.$value.set(value)
      this.onChange?.(value)
    }
    this.close()
  }

  protected onOutsideClick(event: MouseEvent) {
    if (!this.host.contains(event.target as Node)) {
      this.close(false)
    }
  }

  protected onKeydown(event: KeyboardEvent) {
    const last = this.options().length - 1
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault()
        if (!this.$open()) {
          this.open()
          return
        }
        const step = event.key === 'ArrowDown' ? 1 : -1
        this.focus(this.$focused() + step)
        return
      }
      case 'Home':
      case 'End':
        if (this.$open()) {
          event.preventDefault()
          this.focus(event.key === 'Home' ? 0 : last)
        }
        return
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (!this.$open()) {
          this.open()
        } else if (event.key === 'Enter') {
          this.choose(this.$focused())
        }
        return
      case 'Escape':
        if (this.$open()) {
          event.preventDefault()
          event.stopPropagation()
          this.close()
        }
        return
      case 'Tab':
        if (this.$open()) {
          this.close(false)
        }
        return
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
          this.typeahead(event.key)
        }
    }
  }

  private open() {
    this.$open.set(true)
    this.focus(Math.max(0, this.$selectedIndex()))
  }

  private focus(index: number) {
    const clamped = Math.min(this.options().length - 1, Math.max(0, index))
    this.$focused.set(clamped)
    afterNextRender(
      () => {
        this.host.ownerDocument
          .getElementById(this.optionId(clamped))
          ?.scrollIntoView?.({ block: 'nearest' })
      },
      { injector: this.injector }
    )
  }

  private close(refocus = true) {
    this.$open.set(false)
    if (refocus) {
      this.$trigger().nativeElement.focus()
    }
  }

  private typeahead(char: string) {
    const now = Date.now()
    this.typed = now - this.typedAt > 500 ? char : this.typed + char
    this.typedAt = now
    const needle = this.typed.toLowerCase()
    const index = this.options().findIndex((option) => {
      return this.labelOf(option).toLowerCase().startsWith(needle)
    })
    if (index < 0) {
      return
    }
    if (this.$open()) {
      this.focus(index)
    } else {
      this.choose(index)
    }
  }

  private valueOf(option: object) {
    const key = this.optionValue()
    return key ? this.read(option, key) : option
  }

  private read(option: object, key: string) {
    return (option as Record<string, unknown>)[key]
  }
}
