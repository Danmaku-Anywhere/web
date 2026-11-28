import { Component } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { afterEach, describe, expect, it } from 'vitest'
import { Tooltip } from './tooltip'

@Component({
  imports: [Tooltip],
  template: `
    <button id="now" daTooltip="Add a folder">Add</button>
    <button id="later" daTooltip="A long file name.mp4" tooltipDelay="300">File</button>
  `,
})
class Host {}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function render() {
  TestBed.configureTestingModule({ imports: [Host] })
  const fixture = TestBed.createComponent(Host)
  document.body.appendChild(fixture.nativeElement)
  await fixture.whenStable()
  return fixture
}

function tooltip() {
  return document.querySelector<HTMLElement>('[role="tooltip"]')
}

function hover(id: string, type: 'mouseenter' | 'mouseleave') {
  document.getElementById(id)?.dispatchEvent(new MouseEvent(type))
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('Tooltip', () => {
  it('shows on hover and describes its host', async () => {
    const fixture = await render()

    hover('now', 'mouseenter')
    await wait(0)
    await fixture.whenStable()

    expect(tooltip()?.textContent?.trim()).toBe('Add a folder')
    expect(
      document.getElementById('now')?.getAttribute('aria-describedby')
    ).toBe(tooltip()?.id)
  })

  it('hides on mouse leave', async () => {
    const fixture = await render()
    hover('now', 'mouseenter')
    await wait(0)
    await fixture.whenStable()

    hover('now', 'mouseleave')
    await fixture.whenStable()

    expect(tooltip()).toBeNull()
    expect(
      document.getElementById('now')?.hasAttribute('aria-describedby')
    ).toBe(false)
  })

  it('waits for the delay and never shows if the pointer leaves first', async () => {
    const fixture = await render()

    hover('later', 'mouseenter')
    await wait(100)
    expect(tooltip()).toBeNull()
    hover('later', 'mouseleave')
    await wait(300)
    await fixture.whenStable()

    expect(tooltip()).toBeNull()
  })

  it('shows after the delay', async () => {
    const fixture = await render()

    hover('later', 'mouseenter')
    await wait(350)
    await fixture.whenStable()

    expect(tooltip()?.textContent?.trim()).toBe('A long file name.mp4')
  })

  it('removes the tooltip when its host is destroyed', async () => {
    const fixture = await render()
    hover('now', 'mouseenter')
    await wait(0)
    await fixture.whenStable()

    fixture.destroy()

    expect(tooltip()).toBeNull()
  })
})
