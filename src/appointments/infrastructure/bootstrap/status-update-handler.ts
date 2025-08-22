import { SQSEvent, Context } from 'aws-lambda';
import { AppointmentController } from '../controller/AppointmentController';
import { createLogger } from '../../../common/service/logger';

export const handleStatusUpdate = async (event: SQSEvent, context: Context): Promise<void> => {
  const logger = createLogger('StatusUpdateHandler');
  
  logger.info('Status update handler started', {
    recordCount: event.Records.length,
    requestId: context.awsRequestId
  });

  try {
    const appointmentController = new AppointmentController();
    await appointmentController.updateAppointmentStatus(event);
    
    logger.info('Status update handler completed successfully', {
      requestId: context.awsRequestId
    });
  } catch (error) {
    logger.error('Error updating appointment status', {
      requestId: context.awsRequestId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}; 