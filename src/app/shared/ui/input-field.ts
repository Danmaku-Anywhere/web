import { Directive } from '@angular/core'

@Directive({
  selector: 'input[daInput], textarea[daInput]',
  host: {
    class: 'da-input',
  },
})
export class InputField {}
