import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { AppointmentController } from "../controller/AppointmentController";

export const createAppointment = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const appointmentController = new AppointmentController();
  return await appointmentController.createAppointment(event);
};

export const getAppointmentById = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const appointmentController = new AppointmentController();
  return await appointmentController.getAppointmentById(event);
};