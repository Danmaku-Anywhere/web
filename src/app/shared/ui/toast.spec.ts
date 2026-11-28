import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { afterEach, describe, expect, it } from 'vitest'
import { Toast, type ToastPosition, ToastService } from './toast'

@Component({
  imports: [Toast],
  template: `
    <button id="outside">Outside</button>
    <da-toast [position]="position()" />
    <da-toast key="update-error" />
  `,
})
class Host {
  position = signal<ToastPosition>('bottom-center')
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function render() {
  TestBed.configureTestingModule({ imports: [Host] })
  const fixture = TestBed.createComponent(Host)
  document.body.appendChild(fixture.nativeElement)
  await fixture.whenStable()
  const service = TestBed.inject(ToastService)
  async function add(...args: Parameters<ToastService['add']>) {
    service.add(...args)
    await fixture.whenStable()
  }
  return { fixture, service, add }
}

function messages() {
  return [...document.querySelectorAll<HTMLElement>('.da-toast-message')]
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('Toast', () => {
  it('announces each message as an assertive alert', async () => {
    const { add } = await render()
    await add({ severity: 'success', summary: 'Saved', detail: 'All good' })

    const [message] = messages()
    expect(message.getAttribute('role')).toBe('alert')
    expect(message.getAttribute('aria-live')).toBe('assertive')
    expect(message.getAttribute('aria-atomic')).toBe('true')
    expect(message.classList).toContain('da-toast-message-success')
    expect(message.querySelector('.da-toast-summary')?.textContent).toBe(
      'Saved'
    )
    expect(message.querySelector('.da-toast-detail')?.textContent).toBe(
      'All good'
    )
  })

  it('picks the icon for the severity', async () => {
    const { add } = await render()
    await add({ severity: 'error', summary: 'a' })
    await add({ severity: 'warn', summary: 'b' })

    const icons = messages().map(
      (m) =>
        m.querySelector('.da-toast-message-icon')?.querySelectorAll('path')
          .length
    )
    expect(icons).toEqual([1, 3])
  })

  it('does not take focus from the page', async () => {
    const { fixture, add } = await render()
    const outside = fixture.nativeElement.querySelector(
      '#outside'
    ) as HTMLElement
    outside.focus()

    await add({ severity: 'info', summary: 'Hello' })

    expect(document.activeElement).toBe(outside)
  })

  it('removes a message after its life', async () => {
    const { fixture, add } = await render()
    await add({ severity: 'info', summary: 'Short', life: 50 })
    expect(messages()).toHaveLength(1)

    await wait(80)
    await fixture.whenStable()

    expect(messages()).toHaveLength(0)
  })

  it('keeps sticky messages', async () => {
    const { fixture, add } = await render()
    await add({ severity: 'info', summary: 'Sticky', life: 50, sticky: true })

    await wait(80)
    await fixture.whenStable()

    expect(messages()).toHaveLength(1)
  })

  it('pauses the timer while the pointer is over the message', async () => {
    const { fixture, add } = await render()
    await add({ severity: 'info', summary: 'Hover', life: 50 })
    const [message] = messages()

    message.dispatchEvent(new MouseEvent('mouseenter'))
    await wait(80)
    await fixture.whenStable()
    expect(messages()).toHaveLength(1)

    message.dispatchEvent(new MouseEvent('mouseleave'))
    await wait(80)
    await fixture.whenStable()
    expect(messages()).toHaveLength(0)
  })

  it('closes from the close button, which can be turned off', async () => {
    const { fixture, add } = await render()
    await add({ severity: 'info', summary: 'Closable', life: 60000 })
    await add({ severity: 'info', summary: 'Fixed', closable: false })

    const buttons = document.querySelectorAll<HTMLButtonElement>(
      'button[aria-label="Close"]'
    )
    expect(buttons).toHaveLength(1)
    buttons[0].click()
    await fixture.whenStable()

    expect(messages().map((m) => m.textContent?.trim())).toEqual(['Fixed'])
  })

  it('shows a keyed message only in the toast with that key', async () => {
    const { add } = await render()
    await add({ severity: 'error', summary: 'Keyed', key: 'update-error' })

    const hosts = [...document.querySelectorAll('.da-toast')]
    expect(hosts[0].textContent).not.toContain('Keyed')
    expect(hosts[1].textContent).toContain('Keyed')
  })

  it('clears messages', async () => {
    const { fixture, service, add } = await render()
    await add({ severity: 'info', summary: 'a', life: 60000 })
    await add({ severity: 'info', summary: 'b', life: 60000 })

    service.clear()
    await fixture.whenStable()

    expect(messages()).toHaveLength(0)
  })

  it('moves between the top and bottom of the screen', async () => {
    const { fixture } = await render()
    const wrapper = document.querySelector<HTMLElement>(
      '.cdk-global-overlay-wrapper'
    )
    expect(wrapper?.style.alignItems).toBe('flex-end')

    fixture.componentInstance.position.set('top-center')
    await fixture.whenStable()

    expect(wrapper?.style.alignItems).toBe('flex-start')
    expect(wrapper?.style.justifyContent).toBe('center')
  })
})
