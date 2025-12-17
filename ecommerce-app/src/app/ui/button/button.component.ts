import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button [disabled]="disabled || loading" class="btn"
            [class.primary]="variant==='primary'"
            [class.secondary]="variant==='secondary'"
            [class.ghost]="variant==='ghost'"
            [class.danger]="variant==='danger'"
            [class.sm]="size==='sm'"
            [class.lg]="size==='lg'">
      @if (!loading) {
        <span><ng-content/></span>
      }
      @if (loading) {
        <span>Cargando…</span>
      }
    </button>
  `,
  styles: [`
    .btn {
      border-radius: var(--r2);
      padding: 10px 14px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text);
      box-shadow: var(--elev-1);
      cursor: pointer;
      transition: all 0.2s ease;
      font-weight: 500;
      font-size: 14px;
      line-height: 1.4;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      min-height: 40px;
    }

    .btn:hover {
      transform: translateY(-1px);
      box-shadow: var(--elev-2);
    }

    .btn:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }

    .btn.primary {
      background: var(--accent);
      color: var(--accent-contrast);
      border-color: var(--accent);
    }

    .btn.primary:hover {
      background: color-mix(in srgb, var(--accent) 90%, black);
    }

    .btn.secondary {
      background: var(--surface);
      color: var(--text);
      border-color: var(--border);
    }

    .btn.secondary:hover {
      background: var(--hover-bg);
      border-color: var(--accent);
    }

    .btn.ghost {
      background: transparent;
      border-color: transparent;
      color: var(--accent);
    }

    .btn.ghost:hover {
      background: color-mix(in srgb, var(--accent) 10%, transparent);
    }

    .btn.danger {
      background: var(--danger);
      color: white;
      border-color: var(--danger);
    }

    .btn.danger:hover {
      background: color-mix(in srgb, var(--danger) 90%, black);
    }

    .btn.sm { padding: 6px 10px; font-size: 13px; min-height: 32px; }
    .btn.lg { padding: 14px 18px; font-size: 16px; min-height: 48px; }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .btn:disabled:hover {
      transform: none;
      box-shadow: var(--elev-1);
    }
  `]
})
export class ButtonComponent {
  @Input() variant: Variant = 'primary';
  @Input() size: Size = 'md';
  @Input() disabled = false;
  @Input() loading = false;
}
