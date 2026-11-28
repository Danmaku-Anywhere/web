import { Component, signal } from '@angular/core'
import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { FormsModule } from '@angular/forms'
import { afterEach, describe, expect, it } from 'vitest'
import { Select } from './select'

@Component({
  imports: [Select, FormsModule],
  template: `
    <da-select
      [options]="options"
      optionLabel="label"
      optionValue="value"
      placeholder="Pick a mode"
      [(ngModel)]="value"
    />
    <button id="outside">Outside</button>
  `,
})
class Host {
  options = [
    { label: 'Same-Origin Iframe', value: 'same' },
    { label: 'Cross-Origin Iframe', value: 'cross' },
    { label: 'Native Video', value: 'native' },
  ]
  value = signal<string | undefined>(undefined)
}

async function render() {
  TestBed.configureTestingModule({ imports: [Host] })
  const fixture = TestBed.createComponent(Host)
  document.body.appendChild(fixture.nativeElement)
  await fixture.whenStable()
  return fixture
}

function trigger() {
  return document.querySelector<HTMLElement>('[role="combobox"]') as HTMLElement
}

function options() {
  return [...document.querySelectorAll<HTMLElement>('[role="option"]')]
}

async function press(fixture: ComponentFixture<Host>, key: string) {
  trigger().dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
  await fixture.whenStable()
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('Select', () => {
  it('shows the placeholder until a value is chosen', async () => {
    await render()

    expect(trigger().textContent?.trim()).toBe('Pick a mode')
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
    expect(options()).toHaveLength(0)
  })

  it('opens a listbox on click and picks an option', async () => {
    const fixture = await render()

    trigger().click()
    await fixture.whenStable()
    expect(trigger().getAttribute('aria-expanded')).toBe('true')
    expect(trigger().getAttribute('aria-controls')).toBe(
      document.querySelector('[role="listbox"]')?.id
    )

    options()[1].click()
    await fixture.whenStable()

    expect(fixture.componentInstance.value()).toBe('cross')
    expect(trigger().textContent?.trim()).toBe('Cross-Origin Iframe')
    expect(options()).toHaveLength(0)
    expect(document.activeElement).toBe(trigger())
  })

  it('moves the active option with the arrow keys and picks it on Enter', async () => {
    const fixture = await render()
    trigger().focus()

    await press(fixture, 'ArrowDown')
    expect(trigger().getAttribute('aria-activedescendant')).toBe(
      options()[0].id
    )

    await press(fixture, 'ArrowDown')
    await press(fixture, 'ArrowDown')
    await press(fixture, 'ArrowDown')
    expect(trigger().getAttribute('aria-activedescendant')).toBe(
      options()[2].id
    )

    await press(fixture, 'Home')
    expect(trigger().getAttribute('aria-activedescendant')).toBe(
      options()[0].id
    )

    await press(fixture, 'End')
    await press(fixture, 'Enter')

    expect(fixture.componentInstance.value()).toBe('native')
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger())
  })

  it('starts on the selected option and marks it selected', async () => {
    const fixture = await render()
    fixture.componentInstance.value.set('cross')
    await fixture.whenStable()

    await press(fixture, 'Enter')

    expect(trigger().getAttribute('aria-activedescendant')).toBe(
      options()[1].id
    )
    expect(options()[1].getAttribute('aria-selected')).toBe('true')
    expect(options()[0].getAttribute('aria-selected')).toBe('false')
  })

  it('closes on Escape without changing the value or letting the key through', async () => {
    const fixture = await render()
    fixture.componentInstance.value.set('same')
    await fixture.whenStable()
    let escapeReachedDocument = false
    document.addEventListener('keydown', (event) => {
      escapeReachedDocument ||= event.key === 'Escape'
    })

    await press(fixture, 'Enter')
    await press(fixture, 'ArrowDown')
    await press(fixture, 'Escape')

    expect(options()).toHaveLength(0)
    expect(fixture.componentInstance.value()).toBe('same')
    expect(escapeReachedDocument).toBe(false)
  })

  it('jumps to an option by typing while closed', async () => {
    const fixture = await render()

    await press(fixture, 'n')

    expect(fixture.componentInstance.value()).toBe('native')
  })

  it('closes on an outside click without moving focus', async () => {
    const fixture = await render()
    trigger().click()
    await fixture.whenStable()
    const outside = document.getElementById('outside') as HTMLElement
    outside.focus()

    outside.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await fixture.whenStable()

    expect(options()).toHaveLength(0)
    expect(document.activeElement).toBe(outside)
  })
})
