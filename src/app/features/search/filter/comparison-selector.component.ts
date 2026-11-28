import { Component, computed, input, output } from '@angular/core'
import { Button } from '../../../shared/ui/button'
import { Menu, type MenuItem } from '../../../shared/ui/menu'

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
  imports: [Menu, Button],
  template: `
    <button daButton (click)="menu.toggle($event)" severity="secondary" variant="text" size="small"
            class="flex h-full px-2">{{ $displayOp() }}
    </button>
    <da-menu #menu [items]="menuItems" />
  `,
})
export class ComparisonSelector {
  op = input.required<ComparisonOperator>()
  select = output<ComparisonOperator>()

  $displayOp = computed(() => operatorMap[this.op()])

  menuItems: MenuItem[] = operatorOptions.map((item) => ({
    label: item.label,
    command: () => this.select.emit(item.value),
  }))
}
