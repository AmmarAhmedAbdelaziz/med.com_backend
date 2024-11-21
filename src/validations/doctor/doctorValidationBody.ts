import Joi from "joi";

const addressSchema = Joi.object({
  line1: Joi.string().required().messages({
    "string.empty": "Address line 1 is required",
  }),
  line2: Joi.string().optional().allow("").messages({
    "string.empty": "Address line 2 is optional",
  }),
});

const doctorValidationBody = Joi.object({
  name: Joi.string().min(3).required().messages({
    "string.min": "Name must be at least 3 characters long",
    "any.required": "Name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Email is not valid",
    "any.required": "Email is required",
  }),
  password: Joi.string()
    .min(8)
    .max(30)
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&/])[A-Za-z\\d@$!%*?&/]{8,}$"
      )
    ) // Regex for strong password
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters long",
      "string.max": "Password must not exceed 30 characters",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      "any.required": "Password is required",
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

export default doctorValidationBody;
