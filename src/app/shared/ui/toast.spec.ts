import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { afterEach, describe, expect, it } from 'vitest'
import { Toast, ToastService } from './toast'

@Component({
  imports: [Toast],
  template: `
    <button id="outside">Outside</button>
    <da-toast [position]="position()" />
  `,
})
class Host {
  position = signal<'top-center' | 'bottom-center'>('bottom-center')
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
    await add({ severity: 'success', summary: 'b' })

    const fillRules = messages().map((m) =>
      m.querySelector('.da-toast-message-icon path')?.getAttribute('fill-rule')
    )
    expect(fillRules).toEqual(['evenodd', null])
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

  it('sits at the bottom of the screen, or the top on mobile', async () => {
    const { fixture } = await render()
    const wrapper = document.querySelector<HTMLElement>(
      '.cdk-global-overlay-wrapper'
    )
    expect(wrapper?.style.alignItems).toBe('flex-end')
    expect(wrapper?.style.justifyContent).toBe('center')
    fixture.destroy()

    const top = TestBed.createComponent(Toast)
    top.componentRef.setInput('position', 'top-center')
    await top.whenStable()
    const wrappers = document.querySelectorAll<HTMLElement>(
      '.cdk-global-overlay-wrapper'
    )
    expect(wrappers[wrappers.length - 1].style.alignItems).toBe('flex-start')
  })
})
