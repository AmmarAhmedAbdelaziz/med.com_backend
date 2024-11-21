import express from "express";
import adminRouter from "./adminRoute";
import doctorRouter from "./doctorRoute";
import userRouter from "./userRoute";
const router = express.Router();
router.use("/api/admin", adminRouter);
router.use("/api/doctor", doctorRouter);
router.use("/api/user", userRouter);
export default router;
