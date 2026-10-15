import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { formatWhen, statusLabel } from '../core/format';
import { Repair, RepairApplication } from '../core/models';

@Component({
  selector: 'app-repair-detail',
  imports: [RouterLink],
  templateUrl: './repair-detail.page.html',
})
export class RepairDetailPage {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  readonly repair = signal<Repair | null>(null);
  readonly applications = signal<RepairApplication[]>([]);
  readonly error = signal('');
  readonly busy = signal(false);
  readonly formatWhen = formatWhen;
  readonly statusLabel = statusLabel;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Reparação não encontrada.');
      return;
    }
    this.load(id);
  }

  toggle(): void {
    const repair = this.repair();
    if (!repair || this.busy()) {
      return;
    }
    this.busy.set(true);
    const status = repair.status === 'ABERTA' ? 'FECHADA' : 'ABERTA';
    this.api.updateRepairStatus(repair.id, status).subscribe({
      next: (updated) => {
        this.repair.set(updated);
        this.busy.set(false);
      },
      error: () => {
        this.busy.set(false);
        this.error.set('Não foi possível atualizar o estado.');
      },
    });
  }

  private load(id: string): void {
    this.api.repair(id).subscribe({
      next: (repair) => this.repair.set(repair),
      error: () => this.error.set('Não foi possível carregar a reparação.'),
    });
    this.api.applications(id).subscribe({
      next: (applications) => this.applications.set(applications),
      error: () => this.error.set('Não foi possível carregar os interessados.'),
    });
  }
}
