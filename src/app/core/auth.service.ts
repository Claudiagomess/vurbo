import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { AuthResponse, SessionUser } from './models';

const TOKEN_KEY = 'vurbo.token';
const USER_KEY = 'vurbo.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly userState = signal<SessionUser | null>(readUser());

  readonly user = this.userState.asReadonly();

  token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  login(username: string, password: string) {
    return this.http.post<AuthResponse>('/api/auth/login', { username, password }).pipe(
      tap((response) => {
        const user: SessionUser = {
          id: response.id,
          username: response.username,
          name: response.name,
          role: response.role,
        };
        localStorage.setItem(TOKEN_KEY, response.token ?? '');
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this.userState.set(user);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.userState.set(null);
  }

  homeUrl(): string {
    return this.userState()?.role === 'TECNICO' ? '/trabalho' : '/reparacoes';
  }
}

function readUser(): SessionUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw || !localStorage.getItem(TOKEN_KEY)) {
    return null;
  }
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}
