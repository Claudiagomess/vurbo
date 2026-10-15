import { Component, inject, signal } from '@angular/core';
import { ApiService } from '../core/api.service';
import { formatWhen, statusLabel } from '../core/format';
import { MyApplication } from '../core/models';

@Component({
  selector: 'app-my-applications',
  templateUrl: './my-applications.page.html',
})
export class MyApplicationsPage {
  private readonly api = inject(ApiService);
  readonly applications = signal<MyApplication[]>([]);
  readonly error = signal('');
  readonly formatWhen = formatWhen;
  readonly statusLabel = statusLabel;

  constructor() {
    this.api.myApplications().subscribe({
      next: (applications) => this.applications.set(applications),
      error: () => this.error.set('Não foi possível carregar as candidaturas.'),
    });
  }
}
