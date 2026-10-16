import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../core/api';
import { AuthService } from '../core/auth';
import { APPLIANCE_TYPES, LINE_LABEL, STATUS_LABEL, TYPE_LABEL } from '../core/labels';
import { JobApplication, ServiceRequest, errorMessage, money, when } from '../core/models';

@Component({
  selector: 'app-technician',
  imports: [ReactiveFormsModule],
  templateUrl: './tech-page.html',
})
export class TechPage {
  readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  private readonly formBuilder = inject(FormBuilder);
  readonly types = APPLIANCE_TYPES;
  readonly requests = signal<ServiceRequest[]>([]);
  readonly applications = signal<JobApplication[]>([]);
  readonly activeRequest = signal<ServiceRequest | null>(null);
  error = '';
  info = '';
  sending = false;
  photo: File | null = null;
  readonly applyMessage = this.formBuilder.nonNullable.control('');
  readonly applianceForm = this.formBuilder.nonNullable.group({
    applianceType: ['', Validators.required],
    brand: ['', Validators.required],
    model: [''],
    serialNumber: [''],
    notes: [''],
  });

  constructor() {
    void this.reload();
  }

  labelStatus(status: string): string { return STATUS_LABEL[status] ?? status; }
  labelLine(line: string): string { return LINE_LABEL[line] ?? line; }
  labelType(type: string): string { return TYPE_LABEL[type] ?? type; }
  euro(value?: number): string { return money(value); }
  date(value?: string): string { return when(value); }

  onPhoto(event: Event): void {
    this.photo = (event.target as HTMLInputElement).files?.[0] ?? null;
  }

  async reload(): Promise<void> {
    if (this.auth.user()?.status !== 'ACTIVE') return;
    try {
      const [requests, applications] = await Promise.all([
        firstValueFrom(this.api.requests()),
        firstValueFrom(this.api.myApplications()),
      ]);
      this.requests.set(requests);
      this.applications.set(applications);
    } catch (error) {
      this.error = errorMessage(error);
    }
  }

  applied(requestId: number): boolean {
    return this.applications().some((item) => item.requestId === requestId);
  }

  async apply(request: ServiceRequest): Promise<void> {
    this.sending = true;
    this.error = '';
    try {
      await firstValueFrom(this.api.apply(request.id, this.applyMessage.value));
      this.info = 'Candidatura enviada. A Vurbo decide quem fica com o pedido.';
      this.applyMessage.setValue('');
      await this.reload();
    } catch (error) {
      this.error = errorMessage(error);
    } finally {
      this.sending = false;
    }
  }

  async complete(request: ServiceRequest): Promise<void> {
    try {
      await firstValueFrom(this.api.complete(request.id));
      this.info = 'Pedido marcado como concluído.';
      await this.reload();
    } catch (error) {
      this.error = errorMessage(error);
    }
  }

  startAppliance(request: ServiceRequest): void {
    this.activeRequest.set(request);
    this.applianceForm.patchValue({
      applianceType: request.applianceType ?? '',
      brand: request.brand ?? '',
      model: request.model ?? '',
      serialNumber: request.serialNumber ?? '',
    });
  }

  async saveAppliance(): Promise<void> {
    const request = this.activeRequest();
    if (!request || this.applianceForm.invalid) {
      this.applianceForm.markAllAsTouched();
      return;
    }
    this.sending = true;
    try {
      await firstValueFrom(this.api.createAppliance({
        ...this.applianceForm.getRawValue(),
        clientId: request.clientId,
        requestId: request.id,
      }, this.photo));
      this.info = 'Dados do aparelho registados na conta do cliente.';
      this.activeRequest.set(null);
      this.photo = null;
    } catch (error) {
      this.error = errorMessage(error);
    } finally {
      this.sending = false;
    }
  }
}
