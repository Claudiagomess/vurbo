import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ApiConfig } from './api-config';
import { Appliance, ApplianceDetail, JobApplication, Lead, ServiceRequest, User } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ApiConfig);

  private url(path: string): string {
    return `${this.config.url}${path}`;
  }

  requests() {
    return this.http.get<ServiceRequest[]>(this.url('/api/requests'));
  }

  createRequest(payload: unknown, labelPhoto?: File | null) {
    return this.http.post<ServiceRequest>(this.url('/api/requests'), this.form(payload, labelPhoto));
  }

  quote(id: number, cost: number, remuneration: number) {
    return this.http.post<ServiceRequest>(this.url(`/api/requests/${id}/quote`), { cost, remuneration });
  }

  decide(id: number, accept: boolean) {
    return this.http.post<ServiceRequest>(this.url(`/api/requests/${id}/decision`), { accept });
  }

  apply(id: number, message: string) {
    return this.http.post<JobApplication>(this.url(`/api/requests/${id}/applications`), { message });
  }

  applications(id: number) {
    return this.http.get<JobApplication[]>(this.url(`/api/requests/${id}/applications`));
  }

  myApplications() {
    return this.http.get<JobApplication[]>(this.url('/api/applications'));
  }

  decideApplication(id: number, accept: boolean) {
    return this.http.post<JobApplication>(this.url(`/api/applications/${id}/decision`), { accept });
  }

  complete(id: number) {
    return this.http.post<ServiceRequest>(this.url(`/api/requests/${id}/complete`), {});
  }

  appliances() {
    return this.http.get<Appliance[]>(this.url('/api/appliances'));
  }

  appliance(id: number) {
    return this.http.get<ApplianceDetail>(this.url(`/api/appliances/${id}`));
  }

  createAppliance(payload: unknown, labelPhoto?: File | null) {
    return this.http.post<Appliance>(this.url('/api/appliances'), this.form(payload, labelPhoto));
  }

  technicians(status = 'PENDING') {
    return this.http.get<User[]>(this.url(`/api/admin/technicians?status=${status}`));
  }

  decideTechnician(id: number, accept: boolean) {
    return this.http.post<User>(this.url(`/api/admin/technicians/${id}/decision`), { accept });
  }

  leads() {
    return this.http.get<Lead[]>(this.url('/api/admin/leads'));
  }

  createLead(body: { name: string; email: string; phone: string; topic: string; message: string }) {
    return this.http.post<Lead>(this.url('/api/leads'), body);
  }

  private form(payload: unknown, labelPhoto?: File | null): FormData {
    const data = new FormData();
    data.append('payload', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    if (labelPhoto) data.append('labelPhoto', labelPhoto);
    return data;
  }
}
