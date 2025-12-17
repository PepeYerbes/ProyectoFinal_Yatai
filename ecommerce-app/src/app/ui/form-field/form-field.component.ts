import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-form-field',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.css'
})
export class FormFieldComponent {
  @Input() label = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() required = false;
  @Input() disabled = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  get fieldClasses(): string {
    const classes = [];

    if (this.error) {
      classes.push('has-error');
    }

    if (this.disabled) {
      classes.push('disabled');
    }

    if (this.size !== 'md') {
      classes.push(`size-${this.size}`);
    }

    return classes.join(' ');
  }
}
