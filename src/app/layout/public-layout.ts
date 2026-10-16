import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth';
import { homeFor } from '../core/models';

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './public-layout.html',
})
export class PublicLayout {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  area(): string {
    const user = this.auth.user();
    return user ? homeFor(user.role) : '/entrar';
  }

  logout(): void {
    this.auth.clear();
    void this.router.navigateByUrl('/');
  }
}
