import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { errorMessage } from '../core/format';

@Component({
  selector: 'app-repair-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './repair-form.page.html',
})
export class RepairFormPage {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly form = new FormGroup({
    brand: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    applianceType: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    model: new FormControl('', { nonNullable: true }),
    locality: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  submit(): void {
    if (this.form.invalid || this.busy()) {
      this.form.markAllAsTouched();
      return;
    }
    this.busy.set(true);
    this.error.set('');
    this.api.createRepair(this.form.getRawValue()).subscribe({
      next: (repair) => {
        void this.router.navigate(['/reparacoes', repair.id]);
      },
      error: (error: unknown) => {
        this.busy.set(false);
        this.error.set(errorMessage(error, 'Não foi possível criar a reparação.'));
      },
    });
  }
}
