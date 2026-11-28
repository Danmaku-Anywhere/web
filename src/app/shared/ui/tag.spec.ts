import { Component } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { Tag } from './tag'

@Component({
  imports: [Tag],
  template: `
    <da-tag id="value" value="新版本" severity="warn" class="font-bold" />
    <da-tag id="projected" severity="secondary"><span>bangumi</span></da-tag>
    <da-tag id="default" value="x" />
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

describe('Tag', () => {
  it('shows its value with the severity colours and keeps extra classes', () => {
    const get = render()

    const tag = get('value')
    expect(tag.querySelector('.da-tag-label')?.textContent).toBe('新版本')
    expect(tag.classList).toContain('da-tag-warn')
    expect(tag.classList).toContain('font-bold')
  })

  it('projects content before the label', () => {
    const get = render()

    const tag = get('projected')
    expect(tag.firstElementChild?.textContent).toBe('bangumi')
    expect(tag.classList).toContain('da-tag-secondary')
  })

  it('defaults to the primary severity', () => {
    const get = render()

    expect(get('default').classList).toContain('da-tag-primary')
  })
})
