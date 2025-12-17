import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { ProfileResponse, ProfileService } from './profile.service';

export const perfilResolver: ResolveFn<ProfileResponse | null> = (route, state) => {
  const perfilService = inject(ProfileService);
  const router = inject(Router);

  return perfilService.getProfile().pipe(
    catchError((err) => {
      if (err.status === 401) {
        router.navigate(['/auth/login']);
      } else {
        router.navigate(['/']);
      }
      return of(null);
    })
  );
};
