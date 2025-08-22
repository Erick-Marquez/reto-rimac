import { SQSRecord } from "aws-lambda";
import { AppointmentEvent } from "../../domain/entities/AppointmentEntiity";
import { CountryAppoinmentDomainService } from "../../domain/service/CountryAppoinmentDomainService";
import { CountryPEAppointmentRepository } from "../../infrastructure/repository/CountryPEAppointmentRepository";
import { CountryCLAppointmentRepository } from "../../infrastructure/repository/CountryCLAppointmentRepository";
import { CountryAppointmentRepositoryInterface } from "../../domain/repository/CountryAppointmentRepository.interface";
import { COUNTRY_ISO } from "../constant/Constant";

export class CountryAppoinmentApplicationService {

  constructor() {
    
  }

  async createCountryAppointment(record: SQSRecord, country: string): Promise<void>  {

    // Parse the SNS message
    const snsMessage = JSON.parse(record.body);
    const appointmentEvent: AppointmentEvent = JSON.parse(snsMessage.Message);

    const repository = this.getRepositoryByCountry(country);

    if (!repository) {
      throw new Error(`No repository found for country: ${country}`);
    }

    const appointmentDomainService = new CountryAppoinmentDomainService(repository);

    await appointmentDomainService.createAppointment(appointmentEvent);

  }


  private getRepositoryByCountry(countryISO: string): CountryAppointmentRepositoryInterface | null {
    switch (countryISO) {
      case COUNTRY_ISO.CHILE:
        return new CountryCLAppointmentRepository();
      case COUNTRY_ISO.PERU:
        return new CountryPEAppointmentRepository();
      default:
        return null;
    }
  }

}