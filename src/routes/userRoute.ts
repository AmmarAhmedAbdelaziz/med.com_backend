import express from "express";
import {
  bookAppointment,
  cancelAppointment,
  getCheckoutSession,
  getMyAppointments,
  getProfile,
  loginUser,
  registerUser,
  updateProfile,
} from "../controllers/userController";
import authUser from "../middleware/authUser";
import upload from "../utils/multer";
const userRouter = express.Router();
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/get-profile", authUser, getProfile);
userRouter.patch(
  "/update-profile",
  authUser,
  upload.single("image"),
  updateProfile
);
userRouter.post("/book-appointment", authUser, bookAppointment);
userRouter.post("/get-my-appointments", authUser, getMyAppointments);
userRouter.post(
  "/cancel-appointment/:appointmentId",
  authUser,
  cancelAppointment
);
userRouter.get(
  "/checkout-session/:appointmentId",
  authUser,
  getCheckoutSession
);
export default userRouter;
