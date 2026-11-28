import { Component } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { Panel } from './panel'

@Component({
  imports: [Panel],
  template: `
    <da-panel id="static" header="调试控制"><p>static</p></da-panel>
    <da-panel id="by-icon" header="Icon" toggleable><p>icon</p></da-panel>
    <da-panel id="by-header" toggleable collapsed toggler="header">
      <h3 daPanelHeader>资源列表</h3>
      <p>header</p>
    </da-panel>
  `,
})
class Host {}

function render() {
  TestBed.configureTestingModule({ imports: [Host] })
  const fixture = TestBed.createComponent(Host)
  fixture.detectChanges()
  const root = fixture.nativeElement as HTMLElement
  return {
    fixture,
    get: (id: string) => root.querySelector(`#${id}`) as HTMLElement,
  }
}

describe('Panel', () => {
  it('shows a title and no toggle button when it is not toggleable', () => {
    const { get } = render()

    const panel = get('static')
    expect(panel.querySelector('.da-panel-title')?.textContent).toBe('调试控制')
    expect(panel.querySelector('button')).toBeNull()
  })

  it('collapses and expands from the toggle button', () => {
    const { fixture, get } = render()
    const panel = get('by-icon')
    const button = panel.querySelector('button') as HTMLButtonElement

    expect(button.getAttribute('aria-expanded')).toBe('true')

    button.click()
    fixture.detectChanges()
    expect(panel.classList).toContain('da-panel-collapsed')
    expect(button.getAttribute('aria-expanded')).toBe('false')

    panel.querySelector<HTMLElement>('.da-panel-header')?.click()
    fixture.detectChanges()
    expect(panel.classList).toContain('da-panel-collapsed')

    button.click()
    fixture.detectChanges()
    expect(panel.classList).not.toContain('da-panel-collapsed')
  })

  it('starts collapsed and toggles from anywhere on the header', () => {
    const { fixture, get } = render()
    const panel = get('by-header')
    const region = panel.querySelector('[role="region"]') as HTMLElement

    expect(panel.classList).toContain('da-panel-collapsed')
    expect(region.inert).toBe(true)

    panel.querySelector<HTMLElement>('[daPanelHeader]')?.click()
    fixture.detectChanges()
    expect(panel.classList).not.toContain('da-panel-collapsed')
    expect(region.inert).toBe(false)

    panel.querySelector<HTMLButtonElement>('button')?.click()
    fixture.detectChanges()
    expect(panel.classList).toContain('da-panel-collapsed')
  })
})
