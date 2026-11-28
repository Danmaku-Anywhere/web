import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it, vi } from 'vitest'
import { Button, type ButtonSeverity, type ButtonVariant } from './button'

@Component({
  imports: [Button],
  template: `
    <button
      id="native"
      daButton
      [severity]="severity()"
      [variant]="variant()"
      [label]="label()"
      [icon]="icon()"
      [disabled]="disabled()"
      [loading]="loading()"
      (click)="clicks = clicks + 1"
    ></button>
    <button id="submit" daButton type="submit">Send</button>
    <button id="projected-icon" daButton iconOnly rounded size="small"><span>x</span></button>
    <a id="link" daButton href="https://example.com" [loading]="loading()">Link</a>
  `,
})
class Host {
  severity = signal<ButtonSeverity>('primary')
  variant = signal<ButtonVariant>('solid')
  label = signal<string | undefined>('Save')
  icon = signal<string | undefined>(undefined)
  disabled = signal(false)
  loading = signal(false)
  clicks = 0
}

function render() {
  TestBed.configureTestingModule({ imports: [Host] })
  const fixture = TestBed.createComponent(Host)
  fixture.detectChanges()
  const root = fixture.nativeElement as HTMLElement
  function get<T extends HTMLElement>(id: string) {
    return root.querySelector(`#${id}`) as T
  }
  return { fixture, host: fixture.componentInstance, get }
}

describe('Button', () => {
  it('keeps native buttons as type="button" unless told otherwise', () => {
    const { get } = render()

    expect(get('native').getAttribute('type')).toBe('button')
    expect(get('submit').getAttribute('type')).toBe('submit')
  })

  it('does not put a type on links', () => {
    const { get } = render()

    expect(get('link').tagName).toBe('A')
    expect(get('link').hasAttribute('type')).toBe(false)
  })

  it('applies severity, variant and size classes', () => {
    const { fixture, host, get } = render()

    host.severity.set('secondary')
    host.variant.set('text')
    fixture.detectChanges()

    const native = get('native')
    expect(native.classList).toContain('da-button')
    expect(native.classList).toContain('da-button-secondary')
    expect(native.classList).toContain('da-button-text')
    expect(get('projected-icon').classList).toContain('da-button-sm')
  })

  it('renders the label and an icon', () => {
    const { fixture, host, get } = render()

    host.icon.set('pi pi-check')
    fixture.detectChanges()

    const native = get('native')
    expect(native.querySelector('.da-button-label')?.textContent).toBe('Save')
    expect(native.querySelector('.da-button-icon')?.className).toContain(
      'pi-check'
    )
    expect(native.classList).not.toContain('da-button-icon-only')
  })

  it('is icon only when it has an icon and no label', () => {
    const { fixture, host, get } = render()

    host.label.set(undefined)
    host.icon.set('pi pi-check')
    fixture.detectChanges()

    expect(get('native').classList).toContain('da-button-icon-only')
    expect(get('projected-icon').classList).toContain('da-button-icon-only')
    expect(get('projected-icon').classList).toContain('da-button-rounded')
  })

  it('disables the native button and blocks clicks', () => {
    const { fixture, host, get } = render()

    host.disabled.set(true)
    fixture.detectChanges()

    const native = get<HTMLButtonElement>('native')
    expect(native.disabled).toBe(true)
    native.click()
    expect(host.clicks).toBe(0)
  })

  it('disables the button and shows a spinner while loading', () => {
    const { fixture, host, get } = render()

    host.icon.set('pi pi-check')
    host.loading.set(true)
    fixture.detectChanges()

    const native = get<HTMLButtonElement>('native')
    expect(native.disabled).toBe(true)
    expect(native.querySelector('.pi-spinner')).not.toBeNull()
    expect(native.querySelector('.pi-check')).toBeNull()
  })

  it('takes a loading link out of the tab order instead of disabling it', () => {
    const { fixture, host, get } = render()

    host.loading.set(true)
    fixture.detectChanges()

    const link = get('link')
    expect(link.getAttribute('aria-disabled')).toBe('true')
    expect(link.getAttribute('tabindex')).toBe('-1')
    expect(link.classList).toContain('da-button-disabled')
  })

  it('stays focusable and clickable when enabled', () => {
    const { host, get } = render()
    const native = get<HTMLButtonElement>('native')
    const onClick = vi.fn()
    native.addEventListener('click', onClick)

    native.focus()
    native.click()

    expect(document.activeElement).toBe(native)
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(host.clicks).toBe(1)
  })
})
