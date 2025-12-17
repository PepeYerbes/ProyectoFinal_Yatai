import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'ui-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css'
})
export class SearchBarComponent {
  @Input() placeholder = 'Buscar productos...';
  @Input() query = '';
  @Input() disabled = false;
  @Input() showClearButton = true;
  @Input() showSearchText = false;
  @Input() variant: 'default' | 'outlined' | 'filled' | 'minimal' = 'default';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() loading = false;
  @Input() searchButtonLabel = 'Buscar';

  @Output() search = new EventEmitter<string>();
  @Output() inputChange = new EventEmitter<string>();
  @Output() clear = new EventEmitter<void>();
  @Output() focus = new EventEmitter<void>();
  @Output() blur = new EventEmitter<void>();

  get containerClasses(): string {
    const classes = [];

    if (this.variant !== 'default') {
      classes.push(`variant-${this.variant}`);
    }

    if (this.size !== 'md') {
      classes.push(`size-${this.size}`);
    }

    if (this.loading) {
      classes.push('loading');
    }

    return classes.join(' ');
  }

  get iconSize(): number {
    switch (this.size) {
      case 'sm': return 16;
      case 'lg': return 24;
      default: return 20;
    }
  }

  onSearch() {
    if (this.query.trim() && !this.disabled && !this.loading) {
      this.search.emit(this.query.trim());
    }
  }

  onInput(event: any) {
    const value = event.target.value;
    this.query = value;
    this.inputChange.emit(value);
  }

  onClear() {
    this.query = '';
    this.clear.emit();
    this.inputChange.emit('');
  }

  onFocus() {
    this.focus.emit();
  }

  onBlur() {
    this.blur.emit();
  }
}
