import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { ThemeService } from './app/core/theme.service';

const theme = new ThemeService();
theme.init();

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
