export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

export interface LogContext {
  [key: string]: any;
}

export class Logger {
  private service: string;
  private level: LogLevel;

  constructor(service: string, level: LogLevel = LogLevel.INFO) {
    this.service = service;
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    return levels.indexOf(level) <= levels.indexOf(this.level);
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level}] [${this.service}] ${message}${contextStr}`;
  }

  error(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage(LogLevel.ERROR, message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(LogLevel.WARN, message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage(LogLevel.INFO, message, context));
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, context));
    }
  }

  // Convenience methods for common patterns
  logAppointmentCreated(appointmentId: string, insuredId: string, countryISO: string): void {
    this.info('Appointment created successfully', {
      appointmentId,
      insuredId,
      countryISO,
      event: 'APPOINTMENT_CREATED'
    });
  }

  logEventPublished(topicArn: string, messageId: string, countryISO: string): void {
    this.info('Event published successfully', {
      topicArn,
      messageId,
      countryISO,
      event: 'SNS_PUBLISHED'
    });
  }

  logEventProcessing(country: string, recordId: string): void {
    this.info(`Processing ${country} event`, {
      recordId,
      country,
      event: 'SQS_PROCESSING'
    });
  }

  logDatabaseOperation(operation: string, tableName: string, recordId?: string): void {
    this.info(`Database operation completed`, {
      operation,
      tableName,
      recordId,
      event: 'DATABASE_OPERATION'
    });
  }
}

// Factory function to create loggers for different services
export const createLogger = (service: string): Logger => {
  const logLevel = (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO;
  return new Logger(service, logLevel);
}; 