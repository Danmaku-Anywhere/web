import { Component } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { Skeleton } from './skeleton'

@Component({
  imports: [Skeleton],
  template: `
    <da-skeleton id="default" />
    <da-skeleton id="sized" width="80px" height="24px" />
    <da-skeleton id="circle" shape="circle" size="2.5rem" />
  `,
})
class Host {}

function render() {
  TestBed.configureTestingModule({ imports: [Host] })
  const fixture = TestBed.createComponent(Host)
  fixture.detectChanges()
  const root = fixture.nativeElement as HTMLElement
  return (id: string) => root.querySelector(`#${id}`) as HTMLElement
}

describe('Skeleton', () => {
  it('fills the width at one line high by default and is hidden from screen readers', () => {
    const get = render()

    const skeleton = get('default')
    expect(skeleton.style.width).toBe('100%')
    expect(skeleton.style.height).toBe('1rem')
    expect(skeleton.getAttribute('aria-hidden')).toBe('true')
  })

  it('takes a width and height', () => {
    const get = render()

    expect(get('sized').style.width).toBe('80px')
    expect(get('sized').style.height).toBe('24px')
  })

  it('uses size for both sides of a circle', () => {
    const get = render()

    const circle = get('circle')
    expect(circle.classList).toContain('da-skeleton-circle')
    expect(circle.style.width).toBe('2.5rem')
    expect(circle.style.height).toBe('2.5rem')
  })
})
