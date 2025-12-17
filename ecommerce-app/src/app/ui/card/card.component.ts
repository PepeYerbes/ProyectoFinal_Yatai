import { Component, Input, AfterContentInit, ContentChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent implements AfterContentInit {
  @Input() variant: 'default' | 'elevated' | 'flat' | 'outline' = 'default';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() interactive = false;

  hasHeaderSlot = false;
  hasImageSlot = false;
  hasFooterSlot = false;

  @ContentChildren('[slot]') slotElements!: QueryList<ElementRef>;

  ngAfterContentInit() {
    this.hasHeaderSlot = this.slotElements.some(el => el.nativeElement.getAttribute('slot') === 'header');
    this.hasImageSlot = this.slotElements.some(el => el.nativeElement.getAttribute('slot') === 'image');
    this.hasFooterSlot = this.slotElements.some(el => el.nativeElement.getAttribute('slot') === 'footer');
  }

  get cardClasses(): string {
    const classes = [];

    if (this.variant !== 'default') {
      classes.push(`card-${this.variant}`);
    }

    if (this.size !== 'md') {
      classes.push(`card-${this.size}`);
    }

    if (this.interactive) {
      classes.push('card-interactive');
    }

    return classes.join(' ');
  }
}
