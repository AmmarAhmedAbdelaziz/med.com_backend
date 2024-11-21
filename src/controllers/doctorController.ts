import { NextFunction, Request, Response } from "express";
import doctorModel from "../models/doctorModel";
import mongoose from "mongoose";
import loginValidationSchema from "../validations/doctor/login";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel";
import doctorValidationUpdateBody from "../validations/doctor/updateDoctorProfileBody";
import cloudinary from "../utils/cloudinary";
import doctorRegisterValidationBody from "../validations/doctorRegisterValidationBody";
dotenv.config({ path: "./config.env" });
const changeAvailability = async (req: Request, res: Response) => {
  try {
    const { docId } = req.params;
    const doctor = await doctorModel.findById(docId);
    await doctorModel.findByIdAndUpdate(docId, {
      available: !doctor.available,
    });
    res
      .status(200)
      .json({ status: "error", message: "Availability updated successfully" });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
const getDoctorsList = async (req: Request, res: Response) => {
  try {
    const doctors = await doctorModel.find({}).select(["-password", "-email"]);
    res.status(200).json({
      status: "success",
      data: doctors,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to get doctors list",
    });
  }
};
const getDoctorById = async (req: Request, res: Response) => {
  try {
    const { docId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(docId)) {
      res.status(400).json({
        status: "error",
        message: "Invalid doctor ID format",
      });
      return;
    }
    const existing_doctor = await doctorModel
      .findById(docId)
      .select(["-password"]);

    if (!existing_doctor) {
      res.status(404).json({
        status: "error",
        message: "Doctor Not Found",
      });
      return;
    }
    res.status(200).json({
      status: "success",
      data: existing_doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};
const getDoctorsBySpeciality = async (req: Request, res: Response) => {
  try {
    const { speciality } = req.params;
    const existing_doctors = await doctorModel.find({ speciality });
    if (!existing_doctors) {
      res.status(200).json({
        status: "error",
        data: [],
      });
      return;
    }
    res.status(200).json({
      status: "success",
      data: existing_doctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

const getRelatedDoctors = async (req: Request, res: Response) => {
  try {
    const { docId, speciality } = req.params;
    if (!mongoose.Types.ObjectId.isValid(docId)) {
      res.status(400).json({
        status: "error",
        message: "Invalid doctor ID format",
      });
      return;
    }
    const related_doctors = await doctorModel
      .find({ _id: { $ne: docId }, speciality })
      .select("-password");
    if (!related_doctors) {
      res.status(200).json({
        status: "error",
        data: [],
      });
      return;
    }
    res.status(200).json({
      status: "success",
      data: related_doctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "Something went Wrong",
    });
  }
};
const doctorLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { error } = loginValidationSchema.validate(req.body);
    if (error) {
      res.json({
        status: "validation error",
        message: error?.details[0].message,
      });
      return;
    }
    const doctor = await doctorModel.findOne({ email });
    if (!doctor) {
      res.status(404).json({
        status: "error",
        message: "No user with this email try another one",
      });
      return;
    }
    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      res.status(401).json({
        status: "error",
        message: "Invalid Credentials",
      });
      return;
    }
    const secret = process.env.JWT_SECRET as string | undefined;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    res.status(200).json({
      status: "Success",
      token: jwt.sign({ id: doctor._id }, secret),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "Something went Wrong",
    });
  }
};
const doctorAppointments = async (req: Request, res: Response) => {
  try {
    const docId = (req as any).docId;
    const appointments = await appointmentModel.find({ docId });
    if (!appointments || appointments.length === 0) {
      res.status(200).json({
        data: [],
        status: "success",
      });
      return;
    }
    res.status(200).json({
      data: appointments,
      status: "success",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "Something went Wrong",
    });
  }
};
const doctorProfile = async (req: Request, res: Response) => {
  try {
    const docId = (req as any).docId;
    const profileData = await doctorModel.findById(docId).select("-password");
    if (!profileData) {
      res.status(404).json({
        message: "Not authorized or profile not found",
        status: "error",
      });
      return;
    }
    console.log(profileData);
    res.status(200).json({
      data: profileData,
      status: "success",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "Something went Wrong",
    });
  }
};
const appointmentComplete = async (req: Request, res: Response) => {
  try {
    const { appointmentId } = req.params;

    const docId = (req as any).docId;
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      res.status(404).json({
        status: "error",
        message: "Appointment not found",
      });
      return;
    }

    if (appointment && appointment.docId === docId) {
      if (appointment.cancelled) {
        res.status(400).json({
          status: "error",
          message: "Appointment is cancelled",
        });
        return;
      }
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        isCompleted: true,
      });
      res.status(200).json({
        status: "Success",
      });
      return;
    } else {
      res.status(400).json({
        status: "error",
        message: "Mark Failed",
      });
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "Something went Wrong",
    });
  }
};
const appointmentCancel = async (req: Request, res: Response) => {
  try {
    const { appointmentId } = req.params;

    const docId = (req as any).docId;
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      res.status(404).json({
        status: "error",
        message: "Appointment not found",
      });
      return;
    }
    if (appointment && appointment.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        cancelled: true,
      });
      res.status(200).json({
        status: "Success",
      });
      return;
    } else {
      res.status(400).json({
        status: "error",
        message: "cancellation failed",
      });
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "Something went Wrong",
    });
  }
};
const doctorDashboard = async (req: Request, res: Response) => {
  try {
    const docId = (req as any).docId;
    const appointments = await appointmentModel.find({ docId });
    let earnings = 0;
    if (appointments) {
      appointments.map((appt) => {
        if (appt.isCompleted || appt.payment) {
          earnings += appt.amount;
        }
      });
    }
    let patients: string[] = [];
    appointments.map((appt) => {
      if (!patients.includes(appt.userId)) {
        patients.push(appt.userId);
      }
    });

    const dashData = {
      earnings,
      patients: patients.length,
      appointments: appointments.length,
      latestAppointments: appointments.reverse().slice(0, 5),
    };
    res.status(200).json({
      data: dashData,
      status: "success",
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const docId = (req as any).docId;

    // Extract form data from request body
    const {
      name,
      speciality,
      degree,
      experience,
      about,
      available,
      fees,
      address,
    } = req.body;

    // Validate the request body using Joi
    const { error } = doctorValidationUpdateBody.validate({
      name,
      speciality,
      degree,
      experience,
      about,
      available,
      fees,
      address: JSON.parse(address),
    });
    if (error) {
      res.status(400).json({ message: error.details[0].message });
      return;
    }

    // Check if doctor with the same email already exists
    const existing_doctor = await doctorModel.findById(docId);
    if (!existing_doctor) {
      res.status(404).json({
        status: "error",
        message: "Invalid Doctor Token",
      });
      return;
    }

    // Image upload to Cloudinary
    let imageUrl = existing_doctor.image;
    const imageFile = req.file; // `req.file` contains the uploaded file
    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image", // Specifies that we're uploading an image
      });
      imageUrl = imageUpload.secure_url; // Get the URL of the uploaded image
      console.log("Image uploaded:", imageUpload);
    }

    // Prepare doctor data to be saved
    const doctorData = {
      name,
      speciality,
      degree,
      experience,
      about,
      available,
      fees,
      address: JSON.parse(address), // Address is already validated as an object
      image: imageUrl, // Store the URL of the uploaded image or fallback to default
      date: Date.now(),
    };

    // Save the new doctor to the database
    const updatedProfile = await doctorModel.findByIdAndUpdate(
      existing_doctor._id,
      { ...doctorData },
      { new: true }
    );

    // Send success response
    res.status(200).json({
      message: "Doctor Data Updated Successfully",
      status: "success",
      data: updateProfile,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
    next(error);
  }
};
const registerDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    const { error } = doctorRegisterValidationBody.validate({
      name,
      email,
      password,
    });
    if (error) {
      console.log(error);
      res.status(400).json({ message: error.details[0].message });
      return;
    }
    const existingDoctor = await doctorModel.findOne({ email });
    if (existingDoctor) {
      res.status(400).json({ message: "Email is already in use" });
      return;
    }
    //hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const doctorData = { name, email, password: hashedPassword };
    const newDoctor = new doctorModel(doctorData);
    const doctor = await newDoctor.save();
    console.log(doctor);
    res.status(200).json({
      status: "success",
      message: "doctor created successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: "error",
      message: "Failed To Create Doctor",
    });
  }
};
export {
  changeAvailability,
  getDoctorsList,
  getDoctorById,
  getDoctorsBySpeciality,
  getRelatedDoctors,
  doctorLogin,
  doctorAppointments,
  appointmentComplete,
  appointmentCancel,
  doctorDashboard,
  updateProfile,
  doctorProfile,
  registerDoctor,
};
