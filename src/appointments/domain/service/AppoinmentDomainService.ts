import { AppointmentRepositoryInterface } from "../repository/AppointmentRepositoryInterface";
import { Appointment, AppointmentStatus, AppointmentUpdateEvent } from "../entities/AppointmentEntiity";
import { DynamodbAppointmentRepository } from "../../infrastructure/repository/DynamodbAppointmentRepository";
import { SnsService } from "../../../common/service/sns-service";
import { CountryISO, getTopicArn } from "../../application/constant/Constant";
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from "../../../common/service/logger";

export class AppointmentDomainService {
  private appointmentRepository: AppointmentRepositoryInterface;
  private snsService: SnsService;
  private logger = createLogger('AppointmentDomainService');

  constructor() {
    this.appointmentRepository = new DynamodbAppointmentRepository();
    this.snsService = new SnsService();
  }

  async createAppointment(appointmentData: Partial<Appointment>): Promise<Appointment> {
    // Generate required fields
    const now = new Date().toISOString();
    const appointment: Appointment = {
      id: uuidv4(),
      insuredId: appointmentData.insuredId!,
      scheduleId: appointmentData.scheduleId!,
      countryISO: appointmentData.countryISO!,
      status: AppointmentStatus.PENDING,
      createdAt: now,
      updatedAt: now
    };

    this.logger.info('Creating appointment', {
      appointmentId: appointment.id,
      insuredId: appointment.insuredId,
      countryISO: appointment.countryISO,
      status: appointment.status
    });

    // Create appointment in database
    const createdAppointment = await this.appointmentRepository.create(appointment);
    
    this.logger.logAppointmentCreated(
      createdAppointment.id!,
      createdAppointment.insuredId,
      createdAppointment.countryISO
    );
    
    // Publish event to SNS
    try {
      await this.snsService.publish({
        message: createdAppointment,
        topicArn: getTopicArn(appointment.countryISO as CountryISO)
      });
    } catch (error) {
      this.logger.error('Failed to publish appointment event', {
        appointmentId: createdAppointment.id,
        countryISO: appointment.countryISO,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    return createdAppointment;
  }

  async getAppointmentById(id: string): Promise<Appointment> {
    this.logger.info('Retrieving appointment by ID', { appointmentId: id });
    return this.appointmentRepository.findById(id);
  }

  async updateAppointmentStatus(appointmentUpdateEvent: AppointmentUpdateEvent): Promise<void> {

    this.logger.info('Updating appointment status', { 
      appointmentId: appointmentUpdateEvent.appointmentId, 
      status: appointmentUpdateEvent.status
    });

    await this.appointmentRepository.update(appointmentUpdateEvent.appointmentId, { status: appointmentUpdateEvent.status });


  }
}