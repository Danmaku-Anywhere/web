import { Component } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { Card } from './card'

@Component({
  imports: [Card],
  template: `
    <da-card class="overflow-hidden">
      <div daCardFooter id="footer">footer</div>
      <p id="content">content</p>
      <div daCardHeader id="header">header</div>
    </da-card>
  `,
})
class Host {}

describe('Card', () => {
  it('puts the header first, then the content and the footer in the body', () => {
    TestBed.configureTestingModule({ imports: [Host] })
    const fixture = TestBed.createComponent(Host)
    fixture.detectChanges()
    const card = (fixture.nativeElement as HTMLElement).querySelector(
      'da-card'
    ) as HTMLElement

    expect(card.classList).toContain('da-card')
    expect(card.classList).toContain('overflow-hidden')
    expect(card.firstElementChild?.id).toBe('header')

    const body = card.querySelector('.da-card-body') as HTMLElement
    expect(body.querySelector('.da-card-content #content')).not.toBeNull()
    expect(body.lastElementChild?.id).toBe('footer')
  })
})
