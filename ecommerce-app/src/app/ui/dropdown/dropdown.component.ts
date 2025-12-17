import { Component, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'ui-dropdown',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.css'
})
export class DropdownComponent {
  @Input() menuClass = '';
  @Input() isOpen = false;
  @Output() openChange = new EventEmitter<boolean>();

  constructor(private elementRef: ElementRef) { }

  toggle() {
    this.isOpen = !this.isOpen;
    this.openChange.emit(this.isOpen);
  }

  close() {
    this.isOpen = false;
    this.openChange.emit(this.isOpen);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }
}
