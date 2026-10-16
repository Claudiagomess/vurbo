import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../core/api';
import { LINE_LABEL, STATUS_LABEL, TOPIC_LABEL, TYPE_LABEL } from '../core/labels';
import { JobApplication, Lead, ServiceRequest, User, errorMessage, money, when } from '../core/models';

@Component({
  selector: 'app-admin',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-page.html',
})
export class AdminPage {
  private readonly api = inject(ApiService);
  private readonly formBuilder = inject(FormBuilder);
  readonly technicians = signal<User[]>([]);
  readonly requests = signal<ServiceRequest[]>([]);
  readonly leads = signal<Lead[]>([]);
  readonly applications = signal<Record<number, JobApplication[]>>({});
  readonly quoting = signal<number | null>(null);
  error = '';
  info = '';
  readonly quoteForm = this.formBuilder.nonNullable.group({
    cost: ['', Validators.required],
    remuneration: ['', Validators.required],
  });

  constructor() {
    void this.reload();
  }

  labelStatus(status: string): string { return STATUS_LABEL[status] ?? status; }
  labelLine(line: string): string { return LINE_LABEL[line] ?? line; }
  labelType(type: string): string { return TYPE_LABEL[type] ?? type; }
  labelTopic(topic: string): string { return TOPIC_LABEL[topic] ?? topic; }
  euro(value?: number): string { return money(value); }
  date(value?: string): string { return when(value); }

  async reload(): Promise<void> {
    try {
      const [technicians, requests, leads] = await Promise.all([
        firstValueFrom(this.api.technicians()),
        firstValueFrom(this.api.requests()),
        firstValueFrom(this.api.leads()),
      ]);
      this.technicians.set(technicians);
      this.requests.set(requests);
      this.leads.set(leads);
      const open = requests.filter((request) => request.status === 'OPEN' || request.status === 'ASSIGNED');
      const entries = await Promise.all(open.map(async (request) => [request.id, await firstValueFrom(this.api.applications(request.id))] as const));
      this.applications.set(Object.fromEntries(entries));
    } catch (error) {
      this.error = errorMessage(error);
    }
  }

  async decideTechnician(user: User, accept: boolean): Promise<void> {
    try {
      await firstValueFrom(this.api.decideTechnician(user.id, accept));
      this.info = accept ? `${user.name} pode agora ver pedidos.` : `${user.name} foi recusado.`;
      await this.reload();
    } catch (error) {
      this.error = errorMessage(error);
    }
  }

  startQuote(request: ServiceRequest): void {
    this.quoting.set(request.id);
    this.quoteForm.reset();
  }

  async sendQuote(request: ServiceRequest): Promise<void> {
    if (this.quoteForm.invalid) return;
    const raw = this.quoteForm.getRawValue();
    try {
      await firstValueFrom(this.api.quote(request.id, Number(raw.cost), Number(raw.remuneration)));
      this.info = 'Orçamento enviado ao cliente. Os técnicos só o veem se o cliente aceitar.';
      this.quoting.set(null);
      await this.reload();
    } catch (error) {
      this.error = errorMessage(error);
    }
  }

  async decideApplication(application: JobApplication, accept: boolean): Promise<void> {
    try {
      await firstValueFrom(this.api.decideApplication(application.id, accept));
      this.info = accept ? 'Técnico atribuído. As outras candidaturas foram recusadas.' : 'Candidatura recusada.';
      await this.reload();
    } catch (error) {
      this.error = errorMessage(error);
    }
  }
}
