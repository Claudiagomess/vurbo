import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { formatWhen, statusLabel } from '../core/format';
import { Repair } from '../core/models';

@Component({
  selector: 'app-repairs',
  imports: [RouterLink],
  templateUrl: './repairs.page.html',
})
export class RepairsPage {
  private readonly api = inject(ApiService);
  readonly repairs = signal<Repair[]>([]);
  readonly error = signal('');
  readonly formatWhen = formatWhen;
  readonly statusLabel = statusLabel;

  constructor() {
    this.api.repairs().subscribe({
      next: (repairs) => this.repairs.set(repairs),
      error: () => this.error.set('Não foi possível carregar as reparações.'),
    });
  }
}
