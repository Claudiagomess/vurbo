import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth';
import { errorMessage, homeFor } from '../core/models';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
})
export class RegisterPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  readonly form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: this.formBuilder.nonNullable.control<'CLIENT' | 'TECHNICIAN'>('CLIENT'),
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
      const user = await this.auth.register(this.form.getRawValue());
      await this.router.navigateByUrl(homeFor(user.role));
    } catch (error) {
      this.error = errorMessage(error);
    } finally {
      this.sending = false;
    }
  }
}
