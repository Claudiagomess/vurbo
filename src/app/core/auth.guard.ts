import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Role } from './models';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (auth.user()) {
    return true;
  }
  return inject(Router).createUrlTree(['/login']);
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (!auth.user()) {
    return true;
  }
  return inject(Router).createUrlTree([auth.homeUrl()]);
};

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const expected = route.data['role'] as Role;
  if (auth.user()?.role === expected) {
    return true;
  }
  return inject(Router).createUrlTree([auth.homeUrl()]);
};
