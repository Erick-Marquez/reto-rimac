import { AppointmentCountry, AppointmentEvent, AppointmentStatus } from "../entities/AppointmentEntiity";
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from "../../../common/service/logger";
import { CountryAppointmentRepositoryInterface } from "../repository/CountryAppointmentRepository.interface";
import { EventBridgeService } from "../../../common/service/eventbridge-service";

export class CountryAppoinmentDomainService {

  private logger = createLogger('CountryAppoinmentDomainService');
  private eventBridgeService: EventBridgeService;
 

  constructor(private readonly countryAppointmentRepository: CountryAppointmentRepositoryInterface) {
    this.eventBridgeService = new EventBridgeService();
  }

  async createAppointment(appointmentEvent: AppointmentEvent): Promise<void> {

    // validate if the schedule is free
    const isScheduleFree = await this.countryAppointmentRepository.isScheduleFree(appointmentEvent.scheduleId!);
    if (!isScheduleFree) {
      try {

        await this.eventBridgeService.publishAppointmentStatusUpdate(appointmentEvent.id, AppointmentStatus.CANCELLED);

      } catch (error) {
        this.logger.error('Failed to publish appointment event', {
          appointmentId: appointmentEvent.id,
          countryISO: appointmentEvent.countryISO,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
      return 
    }

    // Generate required fields
    const now = new Date().toISOString();
    const appointment: AppointmentCountry = {
      id: uuidv4(),
      insuredId: appointmentEvent.insuredId,
      scheduleId: appointmentEvent.scheduleId,
      countryISO: appointmentEvent.countryISO,
      status: AppointmentStatus.CONFIRMED,
      external_id: appointmentEvent.id,
      createdAt: now,
      updatedAt: now
    };

    // Create appointment in database
    await this.countryAppointmentRepository.create(appointment);
  
    
    // Publish event to EventBridge success
    try {

      await this.eventBridgeService.publishAppointmentStatusUpdate(appointmentEvent.id, AppointmentStatus.CONFIRMED);

    } catch (error) {
      this.logger.error('Failed to publish appointment event', {
        appointmentId: appointmentEvent.id,
        countryISO: appointment.countryISO,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }


  }

}