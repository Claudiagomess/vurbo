import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const token = auth.token();
  const authed = token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;
  return next(authed).pipe(
    catchError((error: unknown) => {
      const status = typeof error === 'object' && error && 'status' in error ? Number(error.status) : 0;
      if (status === 401 && !request.url.includes('/api/auth/login')) {
        auth.logout();
        void inject(Router).navigateByUrl('/login');
      }
      return throwError(() => error);
    }),
  );
};
