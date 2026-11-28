import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { Badge } from './badge'

@Component({
  imports: [Badge],
  template: `<da-badge [value]="value()" severity="info" />`,
})
class Host {
  value = signal<string | undefined>(undefined)
}

function render() {
  TestBed.configureTestingModule({ imports: [Host] })
  const fixture = TestBed.createComponent(Host)
  fixture.detectChanges()
  const badge = (fixture.nativeElement as HTMLElement).querySelector(
    'da-badge'
  ) as HTMLElement
  return { fixture, host: fixture.componentInstance, badge }
}

describe('Badge', () => {
  it('is a dot without a value', () => {
    const { badge } = render()

    expect(badge.classList).toContain('da-badge-dot')
    expect(badge.classList).toContain('da-badge-info')
  })

  it('is a circle for a single character and a pill otherwise', () => {
    const { fixture, host, badge } = render()

    host.value.set('3')
    fixture.detectChanges()
    expect(badge.classList).toContain('da-badge-circle')
    expect(badge.textContent).toBe('3')

    host.value.set('12')
    fixture.detectChanges()
    expect(badge.classList).not.toContain('da-badge-circle')
    expect(badge.classList).not.toContain('da-badge-dot')
  })
})
