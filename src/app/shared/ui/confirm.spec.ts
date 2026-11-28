import { Component } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ConfirmDialog, ConfirmService } from './confirm'

@Component({
  imports: [ConfirmDialog],
  template: `<button id="opener">Open</button><da-confirm-dialog />`,
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
  const accept = vi.fn()
  const reject = vi.fn()
  const opener = fixture.nativeElement.querySelector('#opener') as HTMLElement
  opener.focus()
  TestBed.inject(ConfirmService).confirm({
    header: 'Restore folders?',
    message: 'Anime, Movies',
    acceptButtonProps: { label: 'Restore', severity: 'primary' },
    rejectButtonProps: { label: 'Clear', severity: 'secondary' },
    accept,
    reject,
  })
  await fixture.whenStable()
  async function settle() {
    await wait(350)
    await fixture.whenStable()
  }
  function button(label: string) {
    return [...document.querySelectorAll<HTMLButtonElement>('button')].find(
      (b) => b.textContent?.trim() === label
    )
  }
  return { fixture, accept, reject, opener, settle, button }
}

function dialog() {
  return document.querySelector<HTMLElement>('[role="alertdialog"]')
}

function pressEscape() {
  document.body.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
  )
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('ConfirmDialog', () => {
  it('shows the header and message in an alert dialog', async () => {
    await render()

    const title = document.getElementById(
      dialog()?.getAttribute('aria-labelledby') ?? ''
    )
    expect(title?.textContent?.trim()).toBe('Restore folders?')
    expect(dialog()?.textContent).toContain('Anime, Movies')
  })

  it('puts reject before accept and focuses reject first', async () => {
    const { button } = await render()

    const footer = document.querySelector('.da-dialog-footer')
    const labels = [...(footer?.querySelectorAll('button') ?? [])].map((b) =>
      b.textContent?.trim()
    )
    expect(labels).toEqual(['Clear', 'Restore'])
    expect(document.activeElement).toBe(button('Clear'))
    expect(button('Restore')?.classList).toContain('da-button-primary')
    expect(button('Clear')?.classList).toContain('da-button-secondary')
  })

  it('runs accept, closes, and returns focus to the opener', async () => {
    const { accept, reject, opener, settle, button } = await render()

    button('Restore')?.click()
    await settle()

    expect(accept).toHaveBeenCalledOnce()
    expect(reject).not.toHaveBeenCalled()
    expect(dialog()).toBeNull()
    expect(document.activeElement).toBe(opener)
  })

  it('runs reject from the reject button', async () => {
    const { accept, reject, settle, button } = await render()

    button('Clear')?.click()
    await settle()

    expect(reject).toHaveBeenCalledOnce()
    expect(accept).not.toHaveBeenCalled()
  })

  it('stays open on Escape and on a mask click, with no close button', async () => {
    const { reject, settle } = await render()

    expect(document.querySelector('button[aria-label="Close"]')).toBeNull()
    pressEscape()
    document.querySelector<HTMLElement>('.cdk-overlay-backdrop')?.click()
    await settle()

    expect(reject).not.toHaveBeenCalled()
    expect(dialog()).not.toBeNull()
  })
})
