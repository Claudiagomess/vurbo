export const STATUS_LABEL: Record<string, string> = {
  SUBMITTED: 'Aguarda orçamento',
  QUOTED: 'Orçamento por decidir',
  REJECTED_BY_CLIENT: 'Recusado pelo cliente',
  OPEN: 'Aberto a técnicos',
  ASSIGNED: 'Técnico atribuído',
  COMPLETED: 'Concluído',
  PENDING: 'Pendente',
  ACCEPTED: 'Aceite',
  REJECTED: 'Recusada',
  ACTIVE: 'Ativa',
};

export const LINE_LABEL: Record<string, string> = {
  VURBO: 'Vurbo',
  VURBO_AIR: 'Vurbo Air',
};

export const TYPE_LABEL: Record<string, string> = {
  REPAIR: 'Reparação',
  AC_INSTALLATION: 'Instalação de ar condicionado',
};

export const TOPIC_LABEL: Record<string, string> = {
  RENT: 'Vurbo Rent',
  CARE: 'Vurbo Care',
  GENERAL: 'Contacto',
};

export const APPLIANCE_TYPES = [
  'Máquina de lavar roupa',
  'Máquina de secar',
  'Máquina de lavar loiça',
  'Frigorífico',
  'Forno',
  'Placa',
  'Exaustor',
  'Micro-ondas',
  'Ar condicionado',
  'Esquentador',
  'Termoacumulador',
  'Outro',
];
