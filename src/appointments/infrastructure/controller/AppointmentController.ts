import { APIGatewayProxyEvent, APIGatewayProxyResult, SQSEvent } from 'aws-lambda';
import { AppointmentApplicationService } from '../../application/service/AppoinmentApplicationService';
import { CreateAppointmentRequestDto, ErrorResponseDto } from '../../application/dto/AppointmentDto';
import { createLogger } from '../../../common/service/logger';
import { validateCreateAppointment } from '../../application/validation/AppointmentValidation';
import { CountryAppoinmentApplicationService } from '../../application/service/CountryAppoinmentApplicationService';


export class AppointmentController {
  private appointmentService: AppointmentApplicationService;
  private countryAppointmentService: CountryAppoinmentApplicationService;
  private logger = createLogger('AppointmentController');

  constructor() {
    this.appointmentService = new AppointmentApplicationService();
    this.countryAppointmentService = new CountryAppoinmentApplicationService();
  }

  async createAppointment(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
      this.logger.info('Creating appointment via HTTP', {
        method: event.httpMethod,
        path: event.path,
        requestId: event.requestContext.requestId
      });

      // Parse request body
      const body = event.body ? JSON.parse(event.body) : {};

      // Validate request body
      const validatedData = validateCreateAppointment(body);
      
      // Call application service
      const result = await this.appointmentService.createAppointment(validatedData as CreateAppointmentRequestDto);

      this.logger.info('Appointment created successfully via HTTP', {
        requestId: event.requestContext.requestId
      });

      return {
        statusCode: 201,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify(result)
      };

    } catch (error) {
      this.logger.error('Error creating appointment via HTTP', {
        requestId: event.requestContext.requestId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      const errorResponse: ErrorResponseDto = {
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      // Handle validation errors
      if (error instanceof Error && error.message.includes('Validation error')) {
        errorResponse.message = 'Validation error';
        errorResponse.details = [error.message.replace('Validation error: ', '')];
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'POST, OPTIONS'
          },
          body: JSON.stringify(errorResponse)
        };
      }

      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify(errorResponse)
      };
    }
  }

  async getAppointmentById(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
      const id = event.pathParameters?.id;
      if (!id) {
        this.logger.warn('Appointment ID missing in request', {
          requestId: event.requestContext.requestId
        });
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ message: 'Appointment ID is required' })
        };
      }

      this.logger.info('Retrieving appointment by ID via HTTP', {
        appointmentId: id,
        requestId: event.requestContext.requestId
      });

      const appointment = await this.appointmentService.getAppointmentById(id);
      
      if (!appointment) {
        this.logger.warn('Appointment not found', {
          appointmentId: id,
          requestId: event.requestContext.requestId
        });
        return {
          statusCode: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ message: 'Appointment not found' })
        };
      }

      this.logger.info('Appointment retrieved successfully via HTTP', {
        appointmentId: id,
        requestId: event.requestContext.requestId
      });

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(appointment)
      };

    } catch (error) {
      this.logger.error('Error getting appointment via HTTP', {
        requestId: event.requestContext.requestId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: 'Internal server error' })
      };
    }
  }

  async registerPEAppointment(event: SQSEvent): Promise<void> {
    this.logger.info('PE appointment registration started', {
      recordCount: event.Records.length
    });
    
    try {
      for (const record of event.Records) {
        await this.countryAppointmentService.createCountryAppointment(record, 'PE');
      }
      
      this.logger.info('PE appointment registration completed successfully');
    } catch (error) {
      this.logger.error('Error registering PE appointment', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async registerCLAppointment(event: SQSEvent): Promise<void> {
    this.logger.info('CL appointment registration started', {
      recordCount: event.Records.length
    });
    
    try {
      for (const record of event.Records) {
        await this.countryAppointmentService.createCountryAppointment(record, 'CL');
      }
      
      this.logger.info('CL appointment registration completed successfully');
    } catch (error) {
      this.logger.error('Error registering CL appointment', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }


  async updateAppointmentStatus(event: SQSEvent): Promise<void> {
    this.logger.info('Appointment status update started', {
      recordCount: event.Records.length
    });
    
    try {
      for (const record of event.Records) {
        // await this.processStatusUpdateRecord(record);

        await this.appointmentService.updateAppointmentStatus(record);
      }
      
      this.logger.info('Appointment status update completed successfully');
    } catch (error) {
      this.logger.error('Error updating appointment status', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

} 