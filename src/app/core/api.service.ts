import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { MyApplication, Repair, RepairApplication, RepairStatus, Technician } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  repairs() {
    return this.http.get<Repair[]>('/api/repairs');
  }

  repair(id: string) {
    return this.http.get<Repair>(`/api/repairs/${id}`);
  }

  createRepair(body: {
    brand: string;
    applianceType: string;
    model: string;
    locality: string;
    description: string;
  }) {
    return this.http.post<Repair>('/api/repairs', body);
  }

  updateRepairStatus(id: string, status: RepairStatus) {
    return this.http.patch<Repair>(`/api/repairs/${id}`, { status });
  }

  applications(repairId: string) {
    return this.http.get<RepairApplication[]>(`/api/repairs/${repairId}/applications`);
  }

  apply(repairId: string) {
    return this.http.post<RepairApplication>(`/api/repairs/${repairId}/applications`, {});
  }

  myApplications() {
    return this.http.get<MyApplication[]>('/api/repairs/applications/mine');
  }

  technicians() {
    return this.http.get<Technician[]>('/api/technicians');
  }

  createTechnician(body: { name: string; username: string; password: string }) {
    return this.http.post<Technician>('/api/technicians', body);
  }

  updateTechnician(id: string, body: { name?: string; active?: boolean; password?: string }) {
    return this.http.patch<Technician>(`/api/technicians/${id}`, body);
  }

  changePassword(body: { currentPassword: string; newPassword: string }) {
    return this.http.patch('/api/auth/password', body);
  }
}
