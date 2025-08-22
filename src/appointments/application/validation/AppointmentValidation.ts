import Joi from 'joi';
import { COUNTRY_ISO } from '../constant/Constant';

export const createAppointmentSchema = Joi.object({
  insuredId: Joi.string().pattern(/^\d{5}$/).required().messages({
    'string.empty': 'insuredId es requerido',
    "string.pattern.base": "El insuredId debe tener exactamente 5 dígitos numéricos",
    'any.required': 'insuredId es requerido'
  }),
  scheduleId: Joi.number().integer().positive().required().messages({
    'number.base': 'scheduleId debe ser un número',
    'number.integer': 'scheduleId debe ser un número entero',
    'number.positive': 'scheduleId debe ser un número positivo',
    'any.required': 'scheduleId es requerido'
  }),
  countryISO: Joi.string().valid(...Object.values(COUNTRY_ISO)).required().messages({
    'string.valid': 'countryISO debe ser CHILE(CL) o PERU(PE)',
    'any.required': 'countryISO es requerido'
  })
});

export const validateCreateAppointment = (data: any) => {
  const { error, value } = createAppointmentSchema.validate(data, { abortEarly: false });
  
  if (error) {
    const errorMessage = `Validation error: ${error.details.map(detail => detail.message).join(', ')}`;
    throw new Error(errorMessage);
  }
  
  return value;
}; 