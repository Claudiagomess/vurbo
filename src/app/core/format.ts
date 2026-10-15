import { HttpErrorResponse } from '@angular/common/http';
import { RepairStatus, Role } from './models';

const when = new Intl.DateTimeFormat('pt-PT', {
  dateStyle: 'short',
  timeStyle: 'short',
});

export function formatWhen(value: string): string {
  return when.format(new Date(value));
}

export function statusLabel(status: RepairStatus): string {
  return status === 'ABERTA' ? 'Aberta' : 'Fechada';
}

export function roleLabel(role: Role): string {
  return role === 'EMPRESA' ? 'Empresa' : 'Técnico';
}

export function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpErrorResponse) {
    const body = error.error as { message?: unknown } | null;
    if (body && typeof body.message === 'string' && body.message.trim()) {
      return body.message;
    }
  }
  return fallback;
}
