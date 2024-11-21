import Joi from "joi";

const addressSchema = Joi.object({
  line1: Joi.string().required().messages({
    "string.empty": "Address line 1 is required",
  }),
  line2: Joi.string().optional().allow("").messages({
    "string.empty": "Address line 2 is optional",
  }),
});

const doctorValidationUpdateBody = Joi.object({
  name: Joi.string().min(3).required().messages({
    "string.min": "Name must be at least 3 characters long",
    "any.required": "Name is required",
  }),

  speciality: Joi.string().required().messages({
    "any.required": "Speciality is required",
  }),
  about: Joi.string().required().messages({
    "any.required": "About is required",
  }),
  experience: Joi.string().required().messages({
    "any.required": "Experience is required",
  }),
  degree: Joi.string().required().messages({
    "any.required": "Degree is required",
  }),
  fees: Joi.number().min(0).required().messages({
    "number.min": "Fees must be at least 0",
    "any.required": "Fees are required",
  }),
  address: addressSchema.required(), // Nest the address schema
  available: Joi.boolean().optional().messages({
    "boolean.base": "Available must be a boolean",
  }),
});

export default doctorValidationUpdateBody;
