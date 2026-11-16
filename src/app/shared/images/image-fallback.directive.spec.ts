import { Component } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { IMAGE_PLACEHOLDER_DATA } from '../placeholder-data'
import { COVER_FALLBACK, ImageFallback } from './image-fallback.directive'

@Component({
  imports: [ImageFallback],
  template: `
    <img id="cover" src="https://lain.bgm.tv/pic/a.jpg" srcset="https://lain.bgm.tv/r/100/pic/a.jpg 1x" daFallback="cover" />
    <img id="plain" src="https://lain.bgm.tv/pic/b.jpg" daFallback />
  `,
})
class Host {}

function render() {
  TestBed.configureTestingModule({ imports: [Host] })
  const fixture = TestBed.createComponent(Host)
  fixture.detectChanges()
  const root = fixture.nativeElement as HTMLElement
  return {
    cover: root.querySelector('#cover') as HTMLImageElement,
    plain: root.querySelector('#plain') as HTMLImageElement,
  }
}

describe('ImageFallback', () => {
  it('swaps a failed cover for the cover artwork and drops its srcset', () => {
    const { cover } = render()

    cover.dispatchEvent(new Event('error'))

    expect(cover.getAttribute('src')).toBe(COVER_FALLBACK)
    expect(cover.hasAttribute('srcset')).toBe(false)
  })

  it('uses the generic placeholder when no fallback is given', () => {
    const { plain } = render()

    plain.dispatchEvent(new Event('error'))

    expect(plain.getAttribute('src')).toBe(IMAGE_PLACEHOLDER_DATA)
  })

  it('does not loop when the fallback fails too', () => {
    const { cover } = render()

    cover.dispatchEvent(new Event('error'))
    cover.setAttribute('src', 'https://example.com/other.jpg')
    cover.dispatchEvent(new Event('error'))

    expect(cover.getAttribute('src')).toBe('https://example.com/other.jpg')
  })
})
