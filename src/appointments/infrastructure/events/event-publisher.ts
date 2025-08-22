import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { COUNTRY_ISO } from '../../application/constant/Constant';

interface AppointmentEvent {
  id: string;
  insuredId: string;
  scheduleId: number;
  countryISO: string;
  createdAt: string;
  eventType: 'APPOINTMENT_CREATED';
}

export class EventPublisher {
  private snsClient: SNSClient;

  constructor() {
    this.snsClient = new SNSClient({ region: 'us-east-1' });
  }

  async publishAppointmentCreated(appointment: {
    id: string;
    insuredId: string;
    scheduleId: number;
    countryISO: string;
    createdAt: string;
  }): Promise<void> {
    const event: AppointmentEvent = {
      ...appointment,
      eventType: 'APPOINTMENT_CREATED'
    };

    const topicArn = this.getTopicArnByCountry(appointment.countryISO);
    
    if (!topicArn) {
      console.warn(`No topic found for country ISO: ${appointment.countryISO}`);
      return;
    }

    try {
      const command = new PublishCommand({
        TopicArn: topicArn,
        Message: JSON.stringify(event),
        MessageAttributes: {
          'eventType': {
            DataType: 'String',
            StringValue: 'APPOINTMENT_CREATED'
          },
          'countryISO': {
            DataType: 'String',
            StringValue: appointment.countryISO
          },
          'appointmentId': {
            DataType: 'String',
            StringValue: appointment.id
          }
        }
      });

      const result = await this.snsClient.send(command);
      
      console.log(`✅ Event published successfully to topic: ${topicArn}`);
      console.log(`📨 Message ID: ${result.MessageId}`);
      console.log(`🇨🇱🇵🇪 Country: ${appointment.countryISO}`);
      console.log(`🆔 Appointment ID: ${appointment.id}`);
      
    } catch (error) {
      console.error('❌ Error publishing event:', error);
      throw error;
    }
  }

  private getTopicArnByCountry(countryISO: string): string | null {
    switch (countryISO) {
      case COUNTRY_ISO.CHILE:
        return process.env.CL_TOPIC_ARN || null;
      case COUNTRY_ISO.PERU:
        return process.env.PE_TOPIC_ARN || null;
      default:
        return null;
    }
  }
} 