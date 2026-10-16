import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiConfig } from '../core/api-config';
import { ApiService } from '../core/api';
import { APPLIANCE_TYPES, LINE_LABEL, STATUS_LABEL, TYPE_LABEL } from '../core/labels';
import { Appliance, ServiceRequest, errorMessage, money, photoUrl, when } from '../core/models';

@Component({
  selector: 'app-client',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './client-page.html',
})
export class ClientPage {
  private readonly api = inject(ApiService);
  private readonly config = inject(ApiConfig);
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  readonly types = APPLIANCE_TYPES;
  readonly requests = signal<ServiceRequest[]>([]);
  readonly appliances = signal<Appliance[]>([]);
  readonly history = signal<ServiceRequest[]>([]);
  readonly selectedAppliance = signal<number | null>(null);
  readonly novo = signal<string | null>(null);
  readonly linha = signal('VURBO');
  error = '';
  info = '';
  sending = false;
  photo: File | null = null;

  readonly requestForm = this.formBuilder.nonNullable.group({
    applianceId: [''],
    applianceType: [''],
    brand: [''],
    model: [''],
    serialNumber: [''],
    problemDescription: [''],
    areaM2: [''],
    acCount: [''],
    brandPreferences: [''],
    address: ['', Validators.required],
    postalCode: ['', Validators.required],
    city: ['', Validators.required],
  });

  readonly applianceForm = this.formBuilder.nonNullable.group({
    applianceType: ['', Validators.required],
    brand: ['', Validators.required],
    model: [''],
    serialNumber: [''],
    notes: [''],
  });

  constructor() {
    void this.reload();
    this.route.queryParamMap.subscribe((params) => {
      this.novo.set(params.get('novo'));
      this.linha.set(params.get('linha') === 'VURBO_AIR' ? 'VURBO_AIR' : 'VURBO');
      this.info = '';
      this.error = '';
    });
  }

  kind(): 'reparacao' | 'instalacao' | null {
    const value = this.novo();
    return value === 'reparacao' || value === 'instalacao' ? value : null;
  }

  line(): string {
    return this.linha();
  }

  labelStatus(status: string): string { return STATUS_LABEL[status] ?? status; }
  labelLine(line: string): string { return LINE_LABEL[line] ?? line; }
  labelType(type: string): string { return TYPE_LABEL[type] ?? type; }
  euro(value?: number): string { return money(value); }
  date(value?: string): string { return when(value); }
  image(url?: string): string | null { return photoUrl(this.config.url, url); }

  onPhoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.photo = input.files?.[0] ?? null;
  }

  useAppliance(id: string): void {
    const appliance = this.appliances().find((item) => String(item.id) === id);
    if (!appliance) return;
    this.requestForm.patchValue({
      applianceType: appliance.applianceType,
      brand: appliance.brand,
      model: appliance.model ?? '',
      serialNumber: appliance.serialNumber ?? '',
    });
  }

  async reload(): Promise<void> {
    try {
      const [requests, appliances] = await Promise.all([
        firstValueFrom(this.api.requests()),
        firstValueFrom(this.api.appliances()),
      ]);
      this.requests.set(requests);
      this.appliances.set(appliances);
    } catch (error) {
      this.error = errorMessage(error);
    }
  }

  async submitRequest(): Promise<void> {
    const kind = this.kind();
    const raw = this.requestForm.getRawValue();
    if (!kind || this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }
    const payload = kind === 'reparacao'
      ? {
          serviceLine: this.line(),
          requestType: 'REPAIR',
          address: raw.address,
          postalCode: raw.postalCode,
          city: raw.city,
          problemDescription: raw.problemDescription,
          applianceType: raw.applianceType,
          brand: raw.brand,
          model: raw.model,
          serialNumber: raw.serialNumber,
          applianceId: raw.applianceId ? Number(raw.applianceId) : null,
        }
      : {
          serviceLine: 'VURBO_AIR',
          requestType: 'AC_INSTALLATION',
          address: raw.address,
          postalCode: raw.postalCode,
          city: raw.city,
          areaM2: Number(raw.areaM2),
          acCount: Number(raw.acCount),
          brandPreferences: raw.brandPreferences,
        };
    this.sending = true;
    this.error = '';
    try {
      await firstValueFrom(this.api.createRequest(payload, this.photo));
      this.info = 'Pedido enviado. A Vurbo vai definir o orçamento.';
      this.photo = null;
      this.requestForm.reset();
      await this.reload();
    } catch (error) {
      this.error = errorMessage(error);
    } finally {
      this.sending = false;
    }
  }

  async decide(request: ServiceRequest, accept: boolean): Promise<void> {
    this.error = '';
    try {
      await firstValueFrom(this.api.decide(request.id, accept));
      this.info = accept ? 'Orçamento aceite. O pedido ficou aberto para técnicos.' : 'Orçamento recusado.';
      await this.reload();
    } catch (error) {
      this.error = errorMessage(error);
    }
  }

  async submitAppliance(): Promise<void> {
    if (this.applianceForm.invalid) {
      this.applianceForm.markAllAsTouched();
      return;
    }
    this.sending = true;
    this.error = '';
    try {
      await firstValueFrom(this.api.createAppliance(this.applianceForm.getRawValue(), this.photo));
      this.info = 'Eletrodoméstico guardado.';
      this.photo = null;
      this.applianceForm.reset();
      await this.reload();
    } catch (error) {
      this.error = errorMessage(error);
    } finally {
      this.sending = false;
    }
  }

  async openAppliance(id: number): Promise<void> {
    this.selectedAppliance.set(id);
    try {
      const detail = await firstValueFrom(this.api.appliance(id));
      this.history.set(detail.history);
    } catch (error) {
      this.error = errorMessage(error);
    }
  }
}
