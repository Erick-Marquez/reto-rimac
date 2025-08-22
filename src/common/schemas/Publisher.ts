export interface PublisherEvent<T> {
    message: T;
    messageAttributes?: Record<string, string>;
    topicArn: string;
}