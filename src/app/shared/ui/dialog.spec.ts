import { Component, signal } from '@angular/core'
import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { afterEach, describe, expect, it } from 'vitest'
import { Dialog, DialogFooter, DialogHeader } from './dialog'

@Component({
  imports: [Dialog, DialogFooter, DialogHeader],
  template: `
    <button id="opener" (click)="visible.set(true)">Open</button>
    <da-dialog
      [visible]="visible()"
      (visibleChange)="onVisibleChange($event)"
      (shown)="shown = shown + 1"
      (hidden)="hidden = hidden + 1"
      [header]="header()"
      [dismissableMask]="dismissableMask()"
      [closeOnEscape]="closeOnEscape()"
      [closable]="closable()"
      maskClass="backdrop-blur-sm"
      panelClass="w-96"
      contentClass="text-sm"
    >
      @if (withBodyButton()) {
        <button id="body-button">Body</button>
      }
      <p>Body text</p>
      @if (withFooter()) {
        <div daDialogFooter>
          <button id="footer-button">Footer</button>
        </div>
      }
    </da-dialog>
  `,
})
class Host {
  visible = signal(false)
  header = signal('Title')
  dismissableMask = signal(false)
  closeOnEscape = signal(true)
  closable = signal(true)
  withBodyButton = signal(true)
  withFooter = signal(true)
  changes: boolean[] = []
  shown = 0
  hidden = 0

  onVisibleChange(visible: boolean) {
    this.changes.push(visible)
    this.visible.set(visible)
  }
}

@Component({
  imports: [Dialog, DialogHeader],
  template: `
    <da-dialog [visible]="true" headless ariaLabel="Search">
      <input id="search" />
    </da-dialog>
    <da-dialog [visible]="false">
      <h2 daDialogHeader>Custom</h2>
    </da-dialog>
  `,
})
class HeadlessHost {}

@Component({
  imports: [Dialog],
  template: `
    <da-dialog
      drawer
      headless
      dismissableMask
      ariaLabel="Navigation"
      [visible]="visible()"
      (visibleChange)="visible.set($event)"
    >
      <a id="first-link" href="#">Home</a>
    </da-dialog>
  `,
})
class DrawerHost {
  visible = signal(true)
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function pane() {
  return document.querySelector<HTMLElement>('.da-dialog')
}

function container() {
  return document.querySelector<HTMLElement>('[role="dialog"]')
}

async function render() {
  TestBed.configureTestingModule({ imports: [Host] })
  const fixture = TestBed.createComponent(Host)
  document.body.appendChild(fixture.nativeElement)
  await fixture.whenStable()
  return fixture
}

async function open(fixture: ComponentFixture<Host>) {
  const opener = fixture.nativeElement.querySelector('#opener') as HTMLElement
  opener.focus()
  opener.click()
  await fixture.whenStable()
  return opener
}

async function settle(fixture: ComponentFixture<Host>) {
  await wait(350)
  await fixture.whenStable()
}

function pressEscape() {
  document.body.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
  )
}

afterEach(() => {
  document.body.innerHTML = ''
  document.body.className = ''
})

describe('Dialog', () => {
  it('renders nothing until it is visible', async () => {
    await render()

    expect(pane()).toBeNull()
  })

  it('opens as a modal dialog labelled by its header', async () => {
    const fixture = await render()
    await open(fixture)

    const dialog = container()
    expect(dialog).not.toBeNull()
    expect(dialog?.getAttribute('aria-modal')).toBe('true')
    const title = document.getElementById(
      dialog?.getAttribute('aria-labelledby') ?? ''
    )
    expect(title?.textContent?.trim()).toBe('Title')
    expect(pane()?.classList).toContain('w-96')
    expect(document.querySelector('.da-dialog-content')?.classList).toContain(
      'text-sm'
    )
    expect(
      document.querySelector('.cdk-overlay-backdrop')?.classList
    ).toContain('backdrop-blur-sm')
    expect(fixture.componentInstance.shown).toBe(1)
  })

  it('focuses the first control in the body', async () => {
    const fixture = await render()
    await open(fixture)

    expect(document.activeElement?.id).toBe('body-button')
  })

  it('falls back to the footer when the body has no control', async () => {
    const fixture = await render()
    fixture.componentInstance.withBodyButton.set(false)
    await fixture.whenStable()
    await open(fixture)

    expect(document.activeElement?.id).toBe('footer-button')
  })

  it('wraps the content in a focus trap', async () => {
    const fixture = await render()
    await open(fixture)

    expect(document.querySelectorAll('.cdk-focus-trap-anchor').length).toBe(2)
  })

  it('closes on Escape and gives focus back to the opener', async () => {
    const fixture = await render()
    const opener = await open(fixture)

    pressEscape()
    await settle(fixture)

    expect(fixture.componentInstance.changes).toEqual([false])
    expect(pane()).toBeNull()
    expect(document.activeElement).toBe(opener)
    expect(fixture.componentInstance.hidden).toBe(1)
  })

  it('ignores Escape when closeOnEscape is off', async () => {
    const fixture = await render()
    fixture.componentInstance.closeOnEscape.set(false)
    await open(fixture)

    pressEscape()
    await settle(fixture)

    expect(pane()).not.toBeNull()
  })

  it('closes from the mask only when the mask is dismissable', async () => {
    const fixture = await render()
    await open(fixture)
    const backdrop = document.querySelector<HTMLElement>(
      '.cdk-overlay-backdrop'
    )

    backdrop?.click()
    await settle(fixture)
    expect(pane()).not.toBeNull()

    fixture.componentInstance.dismissableMask.set(true)
    await fixture.whenStable()
    backdrop?.click()
    await settle(fixture)
    expect(pane()).toBeNull()
  })

  it('closes from the header button, which can be hidden', async () => {
    const fixture = await render()
    await open(fixture)

    const close = document.querySelector<HTMLButtonElement>(
      'button[aria-label="Close"]'
    )
    close?.click()
    await settle(fixture)
    expect(pane()).toBeNull()

    fixture.componentInstance.closable.set(false)
    await open(fixture)
    expect(document.querySelector('button[aria-label="Close"]')).toBeNull()
  })

  it('plays the leave animation before it detaches', async () => {
    const fixture = await render()
    await open(fixture)

    fixture.componentInstance.visible.set(false)
    await fixture.whenStable()
    expect(pane()?.classList).toContain('da-dialog-leave')

    await settle(fixture)
    expect(pane()).toBeNull()
  })

  it('locks page scrolling while open', async () => {
    const fixture = await render()
    await open(fixture)
    expect(document.body.classList).toContain('da-overflow-hidden')

    pressEscape()
    await settle(fixture)
    expect(document.body.classList).not.toContain('da-overflow-hidden')
  })

  it('renders only the projected content when headless', async () => {
    TestBed.configureTestingModule({ imports: [HeadlessHost] })
    const fixture = TestBed.createComponent(HeadlessHost)
    document.body.appendChild(fixture.nativeElement)
    await fixture.whenStable()

    expect(document.querySelector('.da-dialog-header')).toBeNull()
    expect(container()?.getAttribute('aria-label')).toBe('Search')
    expect(document.activeElement?.id).toBe('search')
  })

  it('slides in a drawer on the left that closes from its mask', async () => {
    TestBed.configureTestingModule({ imports: [DrawerHost] })
    const fixture = TestBed.createComponent(DrawerHost)
    document.body.appendChild(fixture.nativeElement)
    await fixture.whenStable()

    const drawer = document.querySelector<HTMLElement>('.da-drawer')
    expect(drawer).not.toBeNull()
    expect(container()?.getAttribute('aria-label')).toBe('Navigation')
    expect(container()?.getAttribute('aria-modal')).toBe('true')
    expect(document.activeElement?.id).toBe('first-link')

    document.querySelector<HTMLElement>('.cdk-overlay-backdrop')?.click()
    await fixture.whenStable()
    expect(fixture.componentInstance.visible()).toBe(false)
    expect(drawer?.classList).toContain('da-drawer-leave')

    await wait(550)
    await fixture.whenStable()
    expect(document.querySelector('.da-drawer')).toBeNull()
  })
})
