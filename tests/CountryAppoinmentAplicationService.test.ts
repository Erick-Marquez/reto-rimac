import { SQSRecord } from "aws-lambda";
import { CountryAppoinmentApplicationService } from "../src/appointments/application/service/CountryAppoinmentApplicationService";
import { CountryAppoinmentDomainService } from "../src/appointments/domain/service/CountryAppoinmentDomainService";
import { COUNTRY_ISO } from "../src/appointments/application/constant/Constant";

// Mock de la clase DomainService
jest.mock("../src/appointments/domain/service/CountryAppoinmentDomainService");

describe("CountryAppoinmentApplicationService", () => {
    let service: CountryAppoinmentApplicationService;
    let mockCreateAppointment: jest.Mock;

    beforeEach(() => {
        service = new CountryAppoinmentApplicationService();

        // @ts-ignore
        mockCreateAppointment = jest.fn();
        // Reemplazamos el constructor del dominio para devolver el mock
        (CountryAppoinmentDomainService as jest.Mock).mockImplementation(() => {
            return {
                createAppointment: mockCreateAppointment,
            };
        });
    });

    it("debería crear una cita para PERU", async () => {
        const appointmentEvent = { id: "1", insuredId: "123" };
        const record: SQSRecord = {
            body: JSON.stringify({ Message: JSON.stringify(appointmentEvent) }),
            messageId: "msg1",
            receiptHandle: "rh",
            attributes: {
                ApproximateReceiveCount: '1',
                SentTimestamp: '123456789',
                SenderId: 'arn:aws:iam::123456789012:role/service-role',
                ApproximateFirstReceiveTimestamp: '123456789',
            },
            messageAttributes: {},
            md5OfBody: "",
            eventSource: "aws:sqs",
            eventSourceARN: "arn:aws:sqs:region:account:queue",
            awsRegion: "us-east-1",
        };

        await service.createCountryAppointment(record, COUNTRY_ISO.PERU);

        expect(mockCreateAppointment).toHaveBeenCalledWith(appointmentEvent);
    });

    it("debería crear una cita para CHILE", async () => {
        const appointmentEvent = { id: "2", insuredId: "456" };
        const record: SQSRecord = {
            body: JSON.stringify({ Message: JSON.stringify(appointmentEvent) }),
            messageId: "msg2",
            receiptHandle: "rh",
            attributes: {
                ApproximateReceiveCount: '1',
                SentTimestamp: '123456789',
                SenderId: 'arn:aws:iam::123456789012:role/service-role',
                ApproximateFirstReceiveTimestamp: '123456789',
            },
            messageAttributes: {},
            md5OfBody: "",
            eventSource: "aws:sqs",
            eventSourceARN: "arn:aws:sqs:region:account:queue",
            awsRegion: "us-east-1",
        };

        await service.createCountryAppointment(record, COUNTRY_ISO.CHILE);

        expect(mockCreateAppointment).toHaveBeenCalledWith(appointmentEvent);
    });

    it("debería lanzar error si el país no tiene repositorio", async () => {
        const appointmentEvent = { id: "3", insuredId: "789" };
        const record: SQSRecord = {
            body: JSON.stringify({ Message: JSON.stringify(appointmentEvent) }),
            messageId: "msg3",
            receiptHandle: "rh",
            attributes: {
                ApproximateReceiveCount: '1',
                SentTimestamp: '123456789',
                SenderId: 'arn:aws:iam::123456789012:role/service-role',
                ApproximateFirstReceiveTimestamp: '123456789',
            },
            messageAttributes: {},
            md5OfBody: "",
            eventSource: "aws:sqs",
            eventSourceARN: "arn:aws:sqs:region:account:queue",
            awsRegion: "us-east-1",
        };

        await expect(service.createCountryAppointment(record, "BR"))
            .rejects
            .toThrow("No repository found for country: BR");
    });
});
