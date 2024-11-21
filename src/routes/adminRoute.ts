import express from "express";
import upload from "../utils/multer";
import {
  addDoctor,
  adminDashboard,
  appointmentCancel,
  getAllAppointments,
  getAllDoctors,
  loginAdmin,
} from "../controllers/adminController";
import authAdmin from "../middleware/authAdmin";
import { changeAvailability } from "../controllers/doctorController";

const adminRouter = express.Router();
adminRouter.post("/add-doctor", authAdmin, upload.single("image"), addDoctor);
adminRouter.post("/all-doctors", authAdmin, getAllDoctors);
adminRouter.post("/change-availability/:docId", authAdmin, changeAvailability);
adminRouter.get("/get-appointments", authAdmin, getAllAppointments);
adminRouter.post(
  "/cancel-appointment/:appointmentId",
  authAdmin,
  appointmentCancel
);
adminRouter.get("/admin-dashboard", authAdmin, adminDashboard);

adminRouter.post("/login", loginAdmin);

export default adminRouter;
