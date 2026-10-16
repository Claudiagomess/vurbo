import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ApiConfig } from './core/api-config';
import { AuthService } from './core/auth';
import { authInterceptor } from './core/auth.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAppInitializer(() => {
      const config = inject(ApiConfig);
      const auth = inject(AuthService);
      return (async () => {
        try {
          const loaded = await fetch('/config.json').then((response) => response.json()) as { apiUrl?: string };
          if (typeof loaded.apiUrl === 'string') config.url = loaded.apiUrl.replace(/\/$/, '');
        } catch {
          // Mantém o endereço local se o ficheiro não estiver disponível.
        }
        await auth.restore();
      })();
    }),
  ],
};
