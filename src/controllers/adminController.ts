import { Request, Response, NextFunction } from "express";
import cloudinary from "../utils/cloudinary"; // Adjust the import if needed
import bcrypt from "bcryptjs";
import doctorModel from "../models/doctorModel"; // Adjust the import if needed
import doctorValidationBody from "../validations/doctor/doctorValidationBody";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import loginValidationSchema from "../validations/doctor/login";
import appointmentModel from "../models/appointmentModel";
import userModel from "../models/userModel";
dotenv.config({ path: "./config.env" });
const addDoctor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract form data from request body
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      available,
      fees,
      address,
    } = req.body;

    // Validate the request body using Joi
    const { error } = doctorValidationBody.validate({
      name,
      email,
      password,
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
    const existing_doctor = await doctorModel.findOne({ email });
    if (existing_doctor) {
      res.status(404).json({
        status: "error",
        message: "Email Already Exist. Please try another email",
      });
      return;
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Image upload to Cloudinary
    let imageUrl;
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
      email,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      available,
      fees,
      address: JSON.parse(address), // Address is already validated as an object
      image: imageUrl || "Image not uploaded", // Store the URL of the uploaded image or fallback to default
      date: Date.now(),
    };

    // Save the new doctor to the database
    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();

    // Send success response
    res.status(200).json({
      message: "Doctor Data Added Successfully",
      status: "success",
      data: newDoctor,
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
//Api for admin login
const loginAdmin = async (req: Request, res: Response) => {
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
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const loginToken = jwt.sign(
        email + password,
        process.env.JWT_SECRET || "medicalcom"
      );
      res.json({
        status: "succes",
        token: loginToken,
      });
      return;
    } else {
      res.status(404).json({
        status: "error",
        message: "Invalid Credentials",
      });
      return;
    }
  } catch (error) {
    console.log(error);

    // Check if error is an instance of Error
    if (error instanceof Error) {
      res.json({
        status: "error",
        message: error.message,
      });
      return;
    } else {
      res.json({
        status: "error",
        message: "An unknown error occurred",
      });
      return;
    }
  }
};
//Get All Doctors for admin panel
const getAllDoctors = async (req: Request, res: Response) => {
  try {
    let doctors = await doctorModel.find({}).select("-password");
    if (!doctors) {
      doctors = [];
    }
    res.json({
      status: "success",
      data: doctors,
    });
  } catch (error: any) {
    console.log(error);
    res.json({ status: "error", message: error.message });
  }
};
const getAllAppointments = async (req: Request, res: Response) => {
  try {
    const appointments = await appointmentModel.find({});

    if (appointments.length === 0) {
      res.status(200).json({
        status: "Success",
        data: appointments,
      });
      return;
    }
    res.status(200).json({
      status: "Success",
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: "Something went wrong" });
  }
};
const appointmentCancel = async (req: Request, res: Response) => {
  try {
    const { appointmentId } = req.params;
    const appointmentData = await appointmentModel.findById(appointmentId);

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });
    //releasing doctor slot
    const { docId, slotDate, slotTime } = appointmentData;
    const doctorData = await doctorModel.findById(docId);
    let slots_booked = doctorData.slots_booked;
    slots_booked[slotDate] = slots_booked[slotDate].filter(
      (e: string) => e !== slotTime
    );

    const updatedDoctor = await doctorModel.findByIdAndUpdate(
      docId,
      { slots_booked },
      { new: true }
    );
    console.log(updatedDoctor);
    res.status(200).json({
      status: "success",
      message: "appointment cancelled",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "Somethimg went wrong",
    });
  }
};
const adminDashboard = async (req: Request, res: Response) => {
  try {
    const doctors = await doctorModel.find({});
    const users = await userModel.find({});
    const appointments = await appointmentModel.find({});
    const dashData = {
      doctors: doctors.length,
      patients: users.length,
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
export {
  addDoctor,
  loginAdmin,
  getAllDoctors,
  getAllAppointments,
  appointmentCancel,
  adminDashboard,
};
