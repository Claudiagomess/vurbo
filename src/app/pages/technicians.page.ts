import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { errorMessage } from '../core/format';
import { Technician } from '../core/models';

@Component({
  selector: 'app-technicians',
  imports: [ReactiveFormsModule],
  templateUrl: './technicians.page.html',
})
export class TechniciansPage {
  private readonly api = inject(ApiService);
  readonly technicians = signal<Technician[]>([]);
  readonly error = signal('');
  readonly notice = signal('');
  readonly busy = signal(false);
  readonly passwords = signal<Record<string, string>>({});
  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    username: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
  });

  constructor() {
    this.reload();
  }

  create(): void {
    if (this.form.invalid || this.busy()) {
      this.form.markAllAsTouched();
      return;
    }
    this.busy.set(true);
    this.error.set('');
    this.notice.set('');
    this.api.createTechnician(this.form.getRawValue()).subscribe({
      next: () => {
        this.form.reset();
        this.busy.set(false);
        this.notice.set('Técnico criado.');
        this.reload();
      },
      error: (error: unknown) => {
        this.busy.set(false);
        this.error.set(errorMessage(error, 'Não foi possível criar o técnico.'));
      },
    });
  }

  toggle(technician: Technician): void {
    this.api.updateTechnician(technician.id, { active: !technician.active }).subscribe({
      next: () => this.reload(),
      error: (error: unknown) => this.error.set(errorMessage(error, 'Não foi possível atualizar o técnico.')),
    });
  }

  setPassword(id: string, value: string): void {
    this.passwords.update((current) => ({ ...current, [id]: value }));
  }

  savePassword(technician: Technician): void {
    const password = this.passwords()[technician.id] ?? '';
    if (password.length < 8) {
      this.error.set('A palavra-passe tem de ter pelo menos 8 caracteres.');
      return;
    }
    this.error.set('');
    this.api.updateTechnician(technician.id, { password }).subscribe({
      next: () => {
        this.passwords.update((current) => ({ ...current, [technician.id]: '' }));
        this.notice.set(`Palavra-passe de ${technician.name} atualizada.`);
      },
      error: (error: unknown) => this.error.set(errorMessage(error, 'Não foi possível atualizar a palavra-passe.')),
    });
  }

  private reload(): void {
    this.api.technicians().subscribe({
      next: (technicians) => this.technicians.set(technicians),
      error: () => this.error.set('Não foi possível carregar os técnicos.'),
    });
  }
}
