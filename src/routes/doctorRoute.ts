import express from "express";
import {
  appointmentCancel,
  appointmentComplete,
  doctorAppointments,
  doctorDashboard,
  doctorLogin,
  doctorProfile,
  getDoctorById,
  getDoctorsBySpeciality,
  getDoctorsList,
  getRelatedDoctors,
  registerDoctor,
  updateProfile,
} from "../controllers/doctorController";
import authDoctor from "../middleware/authDoctor";
import upload from "../utils/multer";
const doctorRouter = express.Router();
doctorRouter.get("/get-doctors", getDoctorsList);
doctorRouter.get("/get-doctor/:docId", getDoctorById);
doctorRouter.get("/get-doctors/:speciality", getDoctorsBySpeciality);
doctorRouter.get("/get-doctors/:docId/:speciality", getRelatedDoctors);
doctorRouter.post("/login", doctorLogin);
doctorRouter.post(
  "/mark-appointment/:appointmentId",
  authDoctor,
  appointmentComplete
);
doctorRouter.post(
  "/cancel-appointment/:appointmentId",
  authDoctor,
  appointmentCancel
);

doctorRouter.post("/login", doctorLogin);
doctorRouter.post("/register", registerDoctor);

doctorRouter.get("/doctor-appointments", authDoctor, doctorAppointments);
doctorRouter.get("/doctor-dashboard", authDoctor, doctorDashboard);
doctorRouter.post(
  "/update-profile",
  authDoctor,
  upload.single("image"),
  updateProfile
);
doctorRouter.get("/doctor-profile", authDoctor, doctorProfile);

export default doctorRouter;
