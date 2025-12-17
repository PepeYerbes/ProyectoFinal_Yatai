import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type IconName = 'search' | 'cart' | 'user' | 'menu' | 'chevron-down' | 'star' | 'heart' | 'sun' | 'moon';

@Component({
  selector: 'ui-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.css'
})
export class IconComponent {
  @Input() name: IconName = 'search';
  @Input() size: number = 20;
  @Input() strokeWidth: number = 2;
  @Input() color: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' = 'default';
  @Input() interactive = false;

  get iconClasses(): string {
    const classes = ['ui-icon'];

    if (this.color !== 'default') {
      classes.push(`color-${this.color}`);
    }

    if (this.interactive) {
      classes.push('interactive');
    }

    return classes.join(' ');
  }
}
