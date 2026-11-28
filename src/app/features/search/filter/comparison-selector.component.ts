import { Component, computed, input, output } from '@angular/core'
import type { MenuItem } from 'primeng/api'
import { MenuModule } from 'primeng/menu'
import { Button } from '../../../shared/ui/button'

export type ComparisonOperator = '>=' | '>' | '=' | '<' | '<='

const operatorOptions: { label: string; value: ComparisonOperator }[] = [
  { label: '≥', value: '>=' },
  { label: '>', value: '>' },
  { label: '=', value: '=' },
  { label: '<', value: '<' },
  { label: '≤', value: '<=' },
]

const operatorMap: Record<ComparisonOperator, string> = {
  '>=': '≥',
  '>': '>',
  '=': '=',
  '<': '<',
  '<=': '≤',
}

@Component({
  selector: 'da-comparison-selector',
  standalone: true,
  imports: [MenuModule, Button],
  template: `
    <button daButton (click)="menu.toggle($event)" severity="secondary" variant="text" size="small"
            class="flex h-full px-2">{{ $displayOp() }}
    </button>
    <p-menu #menu [model]="menuItems" [popup]="true" appendTo="body" />
  `,
})
export class ComparisonSelector {
  op = input.required<ComparisonOperator>()
  select = output<ComparisonOperator>()

  $displayOp = computed(() => operatorMap[this.op()])

  menuItems: MenuItem[] = operatorOptions.map((item) => ({
    ...item,
    command: () => this.select.emit(item.value),
  }))
}
