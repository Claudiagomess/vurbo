import { Component, inject, signal } from '@angular/core';
import { ApiService } from '../core/api.service';
import { errorMessage, formatWhen } from '../core/format';
import { Repair } from '../core/models';

@Component({
  selector: 'app-technician-repairs',
  templateUrl: './technician-repairs.page.html',
})
export class TechnicianRepairsPage {
  private readonly api = inject(ApiService);
  readonly repairs = signal<Repair[]>([]);
  readonly error = signal('');
  readonly pending = signal<string | null>(null);
  readonly formatWhen = formatWhen;

  constructor() {
    this.reload();
  }

  apply(repair: Repair): void {
    if (repair.applied || this.pending()) {
      return;
    }
    this.pending.set(repair.id);
    this.error.set('');
    this.api.apply(repair.id).subscribe({
      next: () => {
        this.pending.set(null);
        this.reload();
      },
      error: (error: unknown) => {
        this.pending.set(null);
        this.error.set(errorMessage(error, 'Não foi possível candidatar-se.'));
      },
    });
  }

  private reload(): void {
    this.api.repairs().subscribe({
      next: (repairs) => this.repairs.set(repairs),
      error: () => this.error.set('Não foi possível carregar as reparações.'),
    });
  }
}
