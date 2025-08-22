import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { PublisherEvent } from '../schemas/Publisher';
import { createLogger } from './logger';

export class SnsService {
  private snsClient: SNSClient;
  private logger = createLogger('SnsService');

  constructor() {
    this.snsClient = new SNSClient({ region: 'us-east-1' });
  }

  async publish<T>(body: PublisherEvent<T>): Promise<void> {
    const topicArn = body.topicArn;
    
    if (!topicArn) {
      this.logger.warn('No topic ARN provided for SNS publish');
      return;
    }

    try {
      const command = new PublishCommand({
        TopicArn: topicArn,
        Message: JSON.stringify(body.message)
      });

      const result = await this.snsClient.send(command);
      
      this.logger.logEventPublished(topicArn, result.MessageId || '', 'UNKNOWN');
      
    } catch (error) {
      this.logger.error('Error publishing event to SNS', { 
        topicArn, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }
} 