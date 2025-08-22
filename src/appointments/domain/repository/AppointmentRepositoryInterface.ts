import { Appointment } from '../entities/AppointmentEntiity';

export interface AppointmentRepositoryInterface {
  create(appointment: Appointment): Promise<Appointment>;
  findById(id: string): Promise<Appointment>;
  findByInsuredId(insuredId: string): Promise<Appointment[]>;
  update(id: string, appointment: Partial<Appointment>): Promise<Appointment | null>;
  delete(id: string): Promise<boolean>;
} 