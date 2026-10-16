import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiConfig } from './api-config';
import { AuthResponse, User } from './models';

const TOKEN_KEY = 'vurbo_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ApiConfig);
  readonly token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  readonly user = signal<User | null>(null);

  async restore(): Promise<void> {
    if (!this.token()) return;
    try {
      this.user.set(await firstValueFrom(this.http.get<User>(`${this.config.url}/api/auth/me`)));
    } catch {
      this.clear();
    }
  }

  async login(email: string, password: string): Promise<User> {
    const response = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.config.url}/api/auth/login`, { email, password }),
    );
    this.keep(response);
    return response.user;
  }

  async register(body: { name: string; email: string; phone: string; password: string; role: 'CLIENT' | 'TECHNICIAN' }): Promise<User> {
    const response = await firstValueFrom(this.http.post<AuthResponse>(`${this.config.url}/api/auth/register`, body));
    this.keep(response);
    return response.user;
  }

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.token.set(null);
    this.user.set(null);
  }

  private keep(response: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, response.token);
    this.token.set(response.token);
    this.user.set(response.user);
  }
}
