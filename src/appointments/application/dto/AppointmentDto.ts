import { AppointmentStatus } from "../../domain/entities/AppointmentEntiity";

export interface CreateAppointmentRequestDto {
  insuredId: string;
  scheduleId: number;
  countryISO: string;
}

export interface CreateAppointmentResponseDto {
  message: string;
  appointment: {
    id?: string;
    insuredId: string;
    scheduleId: number;
    countryISO: string;
    status?: AppointmentStatus;
    createdAt?: string;
    updatedAt?: string;
  };
}

export interface GetAppointmentByIdResponseDto {
  message: string;
  appointment: {
    id?: string;
    insuredId: string;
    scheduleId: number;
    countryISO: string;
    status?: AppointmentStatus;
    createdAt?: string;
    updatedAt?: string;
  };
}

export interface ErrorResponseDto {
  message: string;
  details?: string[];
  error?: string;
} 