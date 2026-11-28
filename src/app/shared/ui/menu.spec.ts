import { Component, viewChild } from '@angular/core'
import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Menu, type MenuItem } from './menu'

@Component({
  imports: [Menu],
  template: `
    <button id="opener" (click)="menu.toggle($event)">Open</button>
    <da-menu #menu [items]="items" (hidden)="hidden = hidden + 1" />
    <button id="outside">Outside</button>
  `,
})
class Host {
  first = vi.fn()
  second = vi.fn()
  items: MenuItem[] = [
    { label: 'Greater than', command: this.first },
    { label: 'Less than', command: this.second },
  ]
  hidden = 0
}

@Component({
  imports: [Menu],
  template: `
    <button id="opener" (click)="menu.toggle($event)">Open</button>
    <da-menu #menu>
      <ng-template>
        <input id="value" />
      </ng-template>
    </da-menu>
  `,
})
class ContentHost {
  menu = viewChild.required(Menu)
}

async function render() {
  TestBed.configureTestingModule({ imports: [Host] })
  const fixture = TestBed.createComponent(Host)
  document.body.appendChild(fixture.nativeElement)
  await fixture.whenStable()
  const opener = document.getElementById('opener') as HTMLElement
  opener.focus()
  opener.click()
  await fixture.whenStable()
  return { fixture, opener }
}

function list() {
  return document.querySelector<HTMLElement>('[role="menu"]')
}

function items() {
  return [...document.querySelectorAll<HTMLElement>('[role="menuitem"]')]
}

async function press(fixture: ComponentFixture<Host>, key: string) {
  list()?.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
  await fixture.whenStable()
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('Menu', () => {
  it('opens below its trigger with focus on the list', async () => {
    await render()

    expect(items().map((item) => item.getAttribute('aria-label'))).toEqual([
      'Greater than',
      'Less than',
    ])
    expect(document.activeElement).toBe(list())
    expect(list()?.hasAttribute('aria-activedescendant')).toBe(false)
  })

  it('moves through items with the arrow keys and runs one on Enter', async () => {
    const { fixture, opener } = await render()

    await press(fixture, 'ArrowDown')
    expect(list()?.getAttribute('aria-activedescendant')).toBe(items()[0].id)
    await press(fixture, 'ArrowDown')
    await press(fixture, 'ArrowDown')
    expect(list()?.getAttribute('aria-activedescendant')).toBe(items()[1].id)
    await press(fixture, 'Home')
    expect(list()?.getAttribute('aria-activedescendant')).toBe(items()[0].id)
    await press(fixture, 'Enter')

    expect(fixture.componentInstance.first).toHaveBeenCalledOnce()
    expect(list()).toBeNull()
    expect(document.activeElement).toBe(opener)
    expect(fixture.componentInstance.hidden).toBe(1)
  })

  it('runs an item on click', async () => {
    const { fixture } = await render()

    items()[1].click()
    await fixture.whenStable()

    expect(fixture.componentInstance.second).toHaveBeenCalledOnce()
    expect(list()).toBeNull()
  })

  it('closes on Escape, returns focus, and keeps the key to itself', async () => {
    const { fixture, opener } = await render()
    let escapeReachedDocument = false
    document.addEventListener('keydown', () => {
      escapeReachedDocument = true
    })

    await press(fixture, 'Escape')

    expect(list()).toBeNull()
    expect(document.activeElement).toBe(opener)
    expect(escapeReachedDocument).toBe(false)
  })

  it('closes when the trigger is clicked again', async () => {
    const { fixture, opener } = await render()

    opener.click()
    await fixture.whenStable()

    expect(list()).toBeNull()
  })

  it('closes on an outside click', async () => {
    const { fixture } = await render()

    document
      .getElementById('outside')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await fixture.whenStable()

    expect(list()).toBeNull()
    expect(fixture.componentInstance.hidden).toBe(1)
  })

  it('creates its content only while open', async () => {
    TestBed.configureTestingModule({ imports: [ContentHost] })
    const fixture = TestBed.createComponent(ContentHost)
    document.body.appendChild(fixture.nativeElement)
    await fixture.whenStable()
    expect(document.getElementById('value')).toBeNull()

    document.getElementById('opener')?.click()
    await fixture.whenStable()

    expect(document.getElementById('value')).not.toBeNull()
    fixture.componentInstance.menu().hide()
    await fixture.whenStable()
    expect(document.getElementById('value')).toBeNull()
  })
})
