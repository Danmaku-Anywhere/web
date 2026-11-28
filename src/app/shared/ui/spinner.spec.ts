import { Component } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { Spinner } from './spinner'

@Component({
  imports: [Spinner],
  template: `<da-spinner class="w-4 h-4" />`,
})
class Host {}

describe('Spinner', () => {
  it('renders a busy progressbar with the spinning circle', () => {
    TestBed.configureTestingModule({ imports: [Host] })
    const fixture = TestBed.createComponent(Host)
    fixture.detectChanges()
    const spinner = (fixture.nativeElement as HTMLElement).querySelector(
      'da-spinner'
    ) as HTMLElement

    expect(spinner.getAttribute('role')).toBe('progressbar')
    expect(spinner.getAttribute('aria-busy')).toBe('true')
    expect(spinner.classList).toContain('w-4')
    expect(spinner.querySelector('svg circle.da-spinner-circle')).not.toBeNull()
  })
})
