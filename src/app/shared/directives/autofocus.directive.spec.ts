import { Component } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { AutofocusDirective } from './autofocus.directive'

@Component({
  imports: [AutofocusDirective],
  template: `
    <input id="plain" />
    <input id="focused" daAutofocus />
  `,
})
class Host {}

describe('AutofocusDirective', () => {
  it('focuses its element after the first render', async () => {
    TestBed.configureTestingModule({ imports: [Host] })
    const fixture = TestBed.createComponent(Host)
    document.body.appendChild(fixture.nativeElement)
    await fixture.whenStable()

    expect(document.activeElement?.id).toBe('focused')
    fixture.nativeElement.remove()
  })
})
