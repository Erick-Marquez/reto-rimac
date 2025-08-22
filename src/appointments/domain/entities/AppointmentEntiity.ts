export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

export interface Appointment {
  id?: string;
  insuredId: string;
  scheduleId: number;
  countryISO: string;
  status?: AppointmentStatus;
  createdAt?: string;
  updatedAt?: string;
}


export interface AppointmentCountry {
  id?: string;
  insuredId: string;
  scheduleId: number;
  countryISO: string;
  external_id: string;
  status?: AppointmentStatus;
  createdAt?: string;
  updatedAt?: string;
}


export interface AppointmentEvent {
  id: string;
  insuredId: string;
  scheduleId: number;
  countryISO: string;
  status: AppointmentStatus;
  createdAt: string;
  eventType: 'APPOINTMENT_CREATED';
}

export interface AppointmentUpdateEvent {
  id: string;
  appointmentId: string;
  status: AppointmentStatus;
  timestamp: string;
  action: string;
}