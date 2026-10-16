export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'CLIENT' | 'TECHNICIAN' | 'ADMIN';
  status: 'ACTIVE' | 'PENDING' | 'REJECTED';
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ServiceRequest {
  id: number;
  serviceLine: 'VURBO' | 'VURBO_AIR';
  requestType: 'REPAIR' | 'AC_INSTALLATION';
  status: string;
  address?: string;
  postalCode: string;
  city: string;
  problemDescription?: string;
  applianceType?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  applianceId?: number;
  labelPhotoUrl?: string;
  areaM2?: number;
  acCount?: number;
  brandPreferences?: string;
  cost?: number;
  remuneration?: number;
  clientId: number;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  assignedTechnicianId?: number;
  assignedTechnicianName?: string;
  createdAt: string;
}

export interface JobApplication {
  id: number;
  requestId: number;
  technicianId: number;
  technicianName: string;
  technicianPhone: string;
  status: string;
  message?: string;
  createdAt: string;
}

export interface Appliance {
  id: number;
  clientId: number;
  clientName: string;
  applianceType: string;
  brand: string;
  model?: string;
  serialNumber?: string;
  notes?: string;
  labelPhotoUrl?: string;
  registeredByName?: string;
  createdAt: string;
}

export interface ApplianceDetail {
  appliance: Appliance;
  history: ServiceRequest[];
}

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  topic: string;
  message: string;
  createdAt: string;
}

export function homeFor(role: User['role']): string {
  if (role === 'ADMIN') return '/admin';
  if (role === 'TECHNICIAN') return '/tecnico';
  return '/cliente';
}

export function errorMessage(error: unknown): string {
  const message = (error as { error?: { message?: string } })?.error?.message;
  return message || 'Não foi possível concluir. Tenta outra vez.';
}

export function money(value?: number): string {
  if (value == null) return '—';
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value);
}

export function when(value?: string): string {
  if (!value) return '';
  return new Intl.DateTimeFormat('pt-PT', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export function photoUrl(apiUrl: string, url?: string): string | null {
  if (!url) return null;
  return url.startsWith('http') ? url : `${apiUrl}${url}`;
}
