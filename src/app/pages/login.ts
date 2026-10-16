import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth';
import { errorMessage, homeFor } from '../core/models';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  error = '';
  sending = false;

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.sending = true;
    this.error = '';
    try {
      const user = await this.auth.login(this.form.getRawValue().email, this.form.getRawValue().password);
      await this.router.navigateByUrl(this.destination(user.role));
    } catch (error) {
      this.error = errorMessage(error);
    } finally {
      this.sending = false;
    }
  }

  private destination(role: 'CLIENT' | 'TECHNICIAN' | 'ADMIN'): string {
    const next = this.route.snapshot.queryParamMap.get('next');
    if (role === 'CLIENT' && next && next.startsWith('/') && !next.startsWith('//')) return next;
    return homeFor(role);
  }
}
