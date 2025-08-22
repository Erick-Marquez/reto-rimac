import { AppointmentDomainService } from "../src/appointments/domain/service/AppoinmentDomainService";
import { AppointmentStatus } from "../src/appointments/domain/entities/AppointmentEntiity";
import { v4 as uuidv4 } from "uuid";
import { SnsService } from "../src/common/service/sns-service";
import { DynamodbAppointmentRepository } from "../src/appointments/infrastructure/repository/DynamodbAppointmentRepository";

// Mock de uuid
jest.mock("uuid", () => ({ v4: jest.fn() }));

// Mock de dependencias
jest.mock("../src/appointments/infrastructure/repository/DynamodbAppointmentRepository");
jest.mock("../src/common/service/sns-service");
jest.mock("../src/common/service/logger", () => ({
    createLogger: () => ({
        info: jest.fn(),
        error: jest.fn(),
        logAppointmentCreated: jest.fn(),
    }),
}));

describe("AppointmentDomainService - createAppointment", () => {
    let service: AppointmentDomainService;
    let mockRepo: any;
    let mockSns: any;
    let mockLogger: any;

    beforeEach(() => {
        // Forzar uuid
        (uuidv4 as jest.Mock).mockReturnValue("test-uuid");

        // Obtener instancias mockeadas
        // const RepoClass = require("../src/appointments/infrastructure/repository/DynamodbAppointmentRepository").DynamodbAppointmentRepository;
        // const SnsClass = require("../src/common/service/sns-service").SnsService;
        mockRepo = new DynamodbAppointmentRepository();
        mockSns = new SnsService();

        service = new AppointmentDomainService();

        // Sobrescribimos las instancias internas de la clase por los mocks
        (service as any).appointmentRepository = mockRepo;
        (service as any).snsService = mockSns;
        mockLogger = (service as any).logger;

        mockRepo.create.mockReset();
        mockSns.publish.mockReset();
        mockLogger.info.mockReset();
        mockLogger.error.mockReset();
        mockLogger.logAppointmentCreated.mockReset();
    });

    it("debería crear la cita y publicar a SNS", async () => {
        const appointmentData = { insuredId: "123", scheduleId: 456, countryISO: "PE" };

        const createdAppointment = {
            id: "test-uuid",
            ...appointmentData,
            status: AppointmentStatus.PENDING,
            createdAt: "2025-01-01T00:00:00Z",
            updatedAt: "2025-01-01T00:00:00Z",
        };

        mockRepo.create.mockResolvedValue(createdAppointment);
        mockSns.publish.mockResolvedValue({});

        const result = await service.createAppointment(appointmentData);

        // Repo debe haber sido llamado
        expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({
            id: "test-uuid",
            insuredId: "123",
            scheduleId: 456,
            countryISO: "PE",
            status: AppointmentStatus.PENDING,
        }));

        // Debe retornar lo creado
        expect(result).toEqual(createdAppointment);

        // Debe loggear
        expect(mockLogger.info).toHaveBeenCalledWith(
            "Creating appointment",
            expect.objectContaining({ appointmentId: "test-uuid" })
        );

        // Debe loggear evento creado
        expect(mockLogger.logAppointmentCreated).toHaveBeenCalledWith(
            "test-uuid", "123", "PE"
        );

        // Debe llamar SNS
        expect(mockSns.publish).toHaveBeenCalledWith({
            message: createdAppointment,
            topicArn: expect.any(String),
        });
    });

    it("debería manejar error en SNS pero aún retornar la cita", async () => {
        const appointmentData = { insuredId: "999", scheduleId: 111, countryISO: "CL" };

        const createdAppointment = {
            id: "test-uuid",
            ...appointmentData,
            status: AppointmentStatus.PENDING,
            createdAt: "2025-01-01T00:00:00Z",
            updatedAt: "2025-01-01T00:00:00Z",
        };

        mockRepo.create.mockResolvedValue(createdAppointment);
        mockSns.publish.mockRejectedValue(new Error("SNS error"));

        const result = await service.createAppointment(appointmentData);

        // Igual debe retornar la cita creada
        expect(result).toEqual(createdAppointment);

        // Debe loggear error
        expect(mockLogger.error).toHaveBeenCalledWith(
            "Failed to publish appointment event",
            expect.objectContaining({
                appointmentId: "test-uuid",
                countryISO: "CL",
                error: "SNS error",
            })
        );
    });
});
