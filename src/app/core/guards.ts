import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth';
import { homeFor } from './models';

export const roleGuard = (role: 'CLIENT' | 'TECHNICIAN' | 'ADMIN'): CanActivateFn => (_, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.user();
  if (!user) {
    return router.createUrlTree(['/entrar'], { queryParams: { next: state.url } });
  }
  if (user.role !== role) {
    return router.createUrlTree([homeFor(user.role)]);
  }
  return true;
};
