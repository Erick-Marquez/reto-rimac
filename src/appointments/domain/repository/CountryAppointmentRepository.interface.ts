import { AppointmentCountry } from '../entities/AppointmentEntiity';

export interface CountryAppointmentRepositoryInterface {
  create(appointment: AppointmentCountry): Promise<void>;

  isScheduleFree(scheduleId: number): Promise<boolean>;
}