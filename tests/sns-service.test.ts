import { SnsService } from "../src/common/service/sns-service";
import { PublishCommand } from "@aws-sdk/client-sns";

// Mock logger
jest.mock("../src/common/service/logger", () => ({
    createLogger: () => ({
        warn: jest.fn(),
        error: jest.fn(),
        logEventPublished: jest.fn(),
    }),
}));

// Mock AWS SDK
jest.mock("@aws-sdk/client-sns", () => {
    return {
        SNSClient: jest.fn().mockImplementation(() => ({
            send: jest.fn(),
        })),
        PublishCommand: jest.fn(),
    };
});

describe("SnsService - publish", () => {
    let snsService: SnsService;
    let mockClient: any;
    let mockLogger: any;

    beforeEach(() => {
        snsService = new SnsService();

        // Obtener mocks internos
        mockClient = (snsService as any).snsClient;
        mockLogger = (snsService as any).logger;

        jest.clearAllMocks();
    });

    it("debería loggear warn si no se pasa topicArn", async () => {
        await snsService.publish({ topicArn: "", message: { foo: "bar" } });

        expect(mockLogger.warn).toHaveBeenCalledWith(
            "No topic ARN provided for SNS publish"
        );
        expect(mockClient.send).not.toHaveBeenCalled();
    });

    it("debería publicar correctamente a SNS y loggear el evento", async () => {
        const fakeMessageId = "12345";
        mockClient.send.mockResolvedValue({ MessageId: fakeMessageId });

        await snsService.publish({ topicArn: "arn:aws:sns:us-east-1:111:topic", message: { foo: "bar" } });

        // Debe construir un PublishCommand
        expect(PublishCommand).toHaveBeenCalledWith({
            TopicArn: "arn:aws:sns:us-east-1:111:topic",
            Message: JSON.stringify({ foo: "bar" }),
        });

        // Debe enviar el comando al cliente
        expect(mockClient.send).toHaveBeenCalled();

        // Debe loggear que se publicó
        expect(mockLogger.logEventPublished).toHaveBeenCalledWith(
            "arn:aws:sns:us-east-1:111:topic",
            fakeMessageId,
            "UNKNOWN"
        );
    });

    it("debería loggear error y lanzar excepción si SNS falla", async () => {
        mockClient.send.mockRejectedValue(new Error("SNS error"));

        await expect(
            snsService.publish({ topicArn: "arn:aws:sns:us-east-1:111:topic", message: { foo: "bar" } })
        ).rejects.toThrow("SNS error");

        expect(mockLogger.error).toHaveBeenCalledWith(
            "Error publishing event to SNS",
            expect.objectContaining({
                topicArn: "arn:aws:sns:us-east-1:111:topic",
                error: "SNS error",
            })
        );
    });
});
