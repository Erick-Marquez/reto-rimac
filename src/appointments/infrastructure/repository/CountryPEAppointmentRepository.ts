import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { createLogger } from '../../../common/service/logger';
import { AppointmentCountry } from '../../domain/entities/AppointmentEntiity';
import { CountryAppointmentRepositoryInterface } from '../../domain/repository/CountryAppointmentRepository.interface';

export class CountryPEAppointmentRepository implements CountryAppointmentRepositoryInterface {
  private docClient: DynamoDBDocumentClient;
  private logger = createLogger('CountryPEAppointmentRepository');
  private tableName: string;

  constructor() {
    const dynamoClient = new DynamoDBClient({});
    this.docClient = DynamoDBDocumentClient.from(dynamoClient);
    this.tableName = process.env.PE_APPOINTMENTS_TABLE || '';
  }

  async create(appointment: AppointmentCountry): Promise<void> {

    try {
      await this.docClient.send(new PutCommand({
        TableName: this.tableName,
        Item: appointment
      }));

      this.logger.logDatabaseOperation('SAVE', this.tableName, appointment.id);
      
    } catch (error) {
      this.logger.error('Error saving appointment to DynamoDB', {
        tableName: this.tableName,
        appointmentId: appointment.id,
        countryISO: appointment.countryISO,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async isScheduleFree(scheduleId: number): Promise<boolean> {

    try {
      
      const response = await this.docClient.send(new ScanCommand({
        TableName: this.tableName,
        FilterExpression: "scheduleId = :scheduleId",
        ExpressionAttributeValues: { ":scheduleId": scheduleId },
        Limit: 1
      }))

      if (!response) {
        return false;
      }

      return response.Count === 0;
        
    } catch (error) {
      this.logger.error('Error validating schedule', {
        scheduleId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }

  }

} 