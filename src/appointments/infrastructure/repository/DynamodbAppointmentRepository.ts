import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { AppointmentRepositoryInterface } from '../../domain/repository/AppointmentRepositoryInterface';
import { Appointment } from '../../domain/entities/AppointmentEntiity';

export class DynamodbAppointmentRepository implements AppointmentRepositoryInterface {
  private docClient: DynamoDBDocumentClient;
  private tableName: string;

  constructor() {
    const dynamoClient = new DynamoDBClient({});
    this.docClient = DynamoDBDocumentClient.from(dynamoClient);
    this.tableName = process.env.APPOINTMENTS_TABLE || '';
    
    if (!this.tableName) {
      throw new Error('APPOINTMENTS_TABLE environment variable is not set');
    }
  }

  async create(appointment: Appointment): Promise<Appointment> {
    await this.docClient.send(new PutCommand({
      TableName: this.tableName,
      Item: appointment
    }));

    return appointment;
  }

  async findById(id: string): Promise<Appointment> {
    const result = await this.docClient.send(new GetCommand({
      TableName: this.tableName,
      Key: { id }
    }));

    return result.Item as Appointment || null;
  }

  async findByInsuredId(insuredId: string): Promise<Appointment[]> {
    const result = await this.docClient.send(new QueryCommand({
      TableName: this.tableName,
      IndexName: 'InsuredIdIndex',
      KeyConditionExpression: 'insuredId = :insuredId',
      ExpressionAttributeValues: {
        ':insuredId': insuredId
      }
    }));

    return (result.Items || []) as Appointment[];
  }

  async update(id: string, appointment: Partial<Appointment>): Promise<Appointment | null> {
    const updateExpression: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    Object.entries(appointment).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        updateExpression.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    });

    if (updateExpression.length === 0) {
      return null;
    }

    // Add updatedAt timestamp
    updateExpression.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const result = await this.docClient.send(new UpdateCommand({
      TableName: this.tableName,
      Key: { id },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    }));

    return result.Attributes as Appointment || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.docClient.send(new DeleteCommand({
      TableName: this.tableName,
      Key: { id },
      ReturnValues: 'ALL_OLD'
    }));

    return !!result.Attributes;
  }
} 