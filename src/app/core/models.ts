export type Role = 'EMPRESA' | 'TECNICO';
export type RepairStatus = 'ABERTA' | 'FECHADA';

export interface SessionUser {
  id: string;
  username: string;
  name: string;
  role: Role;
}

export interface AuthResponse extends SessionUser {
  token: string | null;
}

export interface Repair {
  id: string;
  brand: string;
  applianceType: string;
  model: string | null;
  locality: string;
  description: string;
  status: RepairStatus;
  createdAt: string;
  applicationCount: number;
  applied: boolean;
}

export interface Technician {
  id: string;
  username: string;
  name: string;
  active: boolean;
  createdAt: string;
}

export interface RepairApplication {
  id: string;
  technicianId: string;
  technicianName: string;
  technicianUsername: string;
  createdAt: string;
  position: number;
}

export interface MyApplication {
  id: string;
  createdAt: string;
  position: number;
  repair: Repair;
}
