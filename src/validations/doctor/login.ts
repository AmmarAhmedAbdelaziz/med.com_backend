import Joi from "joi";
const loginValidationSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email is not valid",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(8).max(30).required().messages({
    "string.min": "Password must be at least 8 characters long",
    "string.max": "Password must not exceed 30 characters",
    "any.required": "Password is required",
  }),
});
export default loginValidationSchema;
