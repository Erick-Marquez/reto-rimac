import { SQSRecord } from "aws-lambda";
import { AppointmentUpdateEvent } from "../../domain/entities/AppointmentEntiity";
import { AppointmentDomainService } from "../../domain/service/AppoinmentDomainService";
import { CreateAppointmentRequestDto, CreateAppointmentResponseDto, GetAppointmentByIdResponseDto } from "../dto/AppointmentDto";

export class AppointmentApplicationService {
  private appointmentDomainService: AppointmentDomainService;

  constructor() {
    this.appointmentDomainService = new AppointmentDomainService();
  }

  async createAppointment(appointment: CreateAppointmentRequestDto): Promise<CreateAppointmentResponseDto> {
    const appointmentCreated = await this.appointmentDomainService.createAppointment(appointment);
    return {
      message: 'Appointment created successfully',
      appointment: appointmentCreated
    };
  }

  async getAppointmentById(id: string): Promise<GetAppointmentByIdResponseDto> {
    const appointment = await this.appointmentDomainService.getAppointmentById(id);
    return {
      message: 'Appointment retrieved successfully',
      appointment: appointment
    };
  }

  async updateAppointmentStatus(record: SQSRecord): Promise<void> {

    const snsMessage = JSON.parse(record.body);
    const appointmentEvent: AppointmentUpdateEvent = snsMessage.detail;

    await this.appointmentDomainService.updateAppointmentStatus(appointmentEvent);
  }
}