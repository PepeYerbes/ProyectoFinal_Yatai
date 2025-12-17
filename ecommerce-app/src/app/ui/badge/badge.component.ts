import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-badge',
  standalone: true,
  template: `
    <span class="badge"
          [class.ok]="type==='success'"
          [class.warn]="type==='warning'"
          [class.count]="type==='count'"
          [class.danger]="type==='danger'">
      <ng-content/>
    </span>
  `,
  styles: [`
    .badge {
      padding: 2px 8px;
      border-radius: 999px;
      border: 1px solid var(--border);
      font-size: 12px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 18px;
      height: 18px;
      background: var(--surface);
      color: var(--text);
    }
    .ok {
      background: color-mix(in oklab, var(--success) 15%, transparent);
      border-color: var(--success);
      color: var(--success);
    }
    .warn {
      background: color-mix(in oklab, var(--warning) 15%, transparent);
      border-color: var(--warning);
      color: var(--warning);
    }
    .danger {
      background: color-mix(in oklab, var(--danger) 15%, transparent);
      border-color: var(--danger);
      color: var(--danger);
    }
    .count {
      background: var(--warning);
      color: var(--color-black);
      border: none;
      border-radius: 50%;
      font-weight: bold;
      font-size: 10px;
    }
  `]
})
export class BadgeComponent {
  @Input() type: 'success' | 'warning' | 'danger' | 'count' | 'default' = 'default';
}
