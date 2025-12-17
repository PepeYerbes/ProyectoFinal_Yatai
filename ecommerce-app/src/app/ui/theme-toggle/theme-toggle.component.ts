import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/theme.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'ui-theme-toggle',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.css'
})
export class ThemeToggleComponent implements OnInit, OnDestroy {
  @Input() showLabel = false;
  @Input() variant: 'default' | 'compact' | 'large' = 'default';
  @Input() iconSize = 20;

  isDark = false;
  isTransitioning = false;
  private observer?: MutationObserver;

  constructor(private themeService: ThemeService) { }

  ngOnInit() {
    // Detectar el tema inicial
    this.updateThemeState();

    // Escuchar cambios en el atributo data-theme
    this.observer = new MutationObserver(() => {
      this.updateThemeState();
    });

    this.observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  toggleTheme() {
    this.isTransitioning = true;
    this.themeService.toggle();

    // Reset transition state after animation
    setTimeout(() => {
      this.isTransitioning = false;
    }, 500);
  }

  get buttonClasses(): string {
    const classes = ['theme-toggle-btn'];

    if (this.variant !== 'default') {
      classes.push(`variant-${this.variant}`);
    }

    if (this.isTransitioning) {
      classes.push('transitioning');
    }

    return classes.join(' ');
  }

  private updateThemeState() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    this.isDark = currentTheme === 'dark';
  }
}
