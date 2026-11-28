import {
  afterNextRender,
  booleanAttribute,
  Directive,
  ElementRef,
  inject,
  input,
} from '@angular/core'

@Directive({
  selector: '[daAutofocus]',
})
export class AutofocusDirective {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef)

  daAutofocus = input(true, { transform: booleanAttribute })

  constructor() {
    afterNextRender(() => {
      if (this.daAutofocus()) {
        this.el.nativeElement.focus()
      }
    })
  }
}
