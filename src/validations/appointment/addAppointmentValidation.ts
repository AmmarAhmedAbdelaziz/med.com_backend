import Joi from "joi";

const addAppointmentValidationBody = Joi.object({
  docId: Joi.string()
    .length(24) // ObjectId is a 24-character hexadecimal string
    .hex()
    .required()
    .messages({
      "string.length": "docId must be exactly 24 characters long.",
      "string.hex": "docId must be a valid hexadecimal string.",
      "any.required": "docId is required.",
    }),
  slotDate: Joi.string().required().messages({
    "any.required": "slotDate is required",
  }),
  slotTime: Joi.string().required().messages({
    "any.required": "slotTime is required",
  }),
});

export default addAppointmentValidationBody;
