import { SQSEvent, Context } from 'aws-lambda';
import { AppointmentController } from '../controller/AppointmentController';
import { createLogger } from '../../../common/service/logger';

export const handleEvent = async (event: SQSEvent, context: Context): Promise<void> => {
  const logger = createLogger('CLEventHandler');
  
  logger.info('CL event handler started', {
    recordCount: event.Records.length,
    requestId: context.awsRequestId
  });

  try {
    const appointmentController = new AppointmentController();
    await appointmentController.registerCLAppointment(event);
    
    logger.info('CL event handler completed successfully', {
      requestId: context.awsRequestId
    });
  } catch (error) {
    logger.error('Error processing CL events', {
      requestId: context.awsRequestId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}; 