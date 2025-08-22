import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { createLogger } from './logger';
import { AppointmentStatus } from '../../appointments/domain/entities/AppointmentEntiity';

export interface EventBridgeEvent {
  source: string;
  detailType: string;
  detail: any;
}

export class EventBridgeService {
  private eventBridgeClient: EventBridgeClient;
  private logger = createLogger('EventBridgeService');

  constructor() {
    this.eventBridgeClient = new EventBridgeClient({ region: 'us-east-1' });
  }

  async publishEvent(event: EventBridgeEvent): Promise<void> {
    try {
      const command = new PutEventsCommand({
        Entries: [
          {
            Source: event.source,
            DetailType: event.detailType,
            Detail: JSON.stringify(event.detail),
            EventBusName: 'default'
          }
        ]
      });

      const result = await this.eventBridgeClient.send(command);
      
      this.logger.info('EventBridge event published successfully', {
        source: event.source,
        detailType: event.detailType,
        eventId: result.Entries?.[0]?.EventId
      });
      
    } catch (error) {
      this.logger.error('Error publishing EventBridge event', {
        source: event.source,
        detailType: event.detailType,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async publishAppointmentStatusUpdate(appointmentId: string, status: AppointmentStatus): Promise<void> {
    const event: EventBridgeEvent = {
      source: 'assesment-api.statusUpdate',
      detailType: 'Appointment Status Update',
      detail: {
        appointmentId,
        status,
        timestamp: new Date().toISOString(),
        action: 'update_status_to_completed'
      }
    };

    await this.publishEvent(event);
  }
  
} 