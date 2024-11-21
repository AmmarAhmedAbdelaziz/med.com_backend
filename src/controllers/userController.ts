import { NextFunction, Request, Response } from "express";
import userValidationBody from "../validations/userValidationBody";
import bcrypt from "bcryptjs";
import userModel from "../models/userModel";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import loginValidationSchema from "../validations/doctor/login";
import cloudinary from "../utils/cloudinary";
import doctorModel from "../models/doctorModel";
import appointmentModel from "../models/appointmentModel";
import addAppointmentValidationBody from "../validations/appointment/addAppointmentValidation";
import Stripe from "stripe";
dotenv.config({ path: "./config.env" });
const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    const { error } = userValidationBody.validate({
      name,
      email,
      password,
    });
    if (error) {
      console.log(error);
      res.status(400).json({ message: error.details[0].message });
      return;
    }
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "Email is already in use" });
      return;
    }
    //hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userData = { name, email, password: hashedPassword };
    const newUser = new userModel(userData);
    const user = await newUser.save();
    console.log(user);
    res.status(200).json({
      status: "success",
      message: "user created successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: "error",
      message: "Failed To Create User",
    });
  }
};
//login user
const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { password, email } = req.body;
    const { error } = loginValidationSchema.validate({
      email,
      password,
    });

    if (error) {
      res.status(400).json({ message: error.details[0].message });
      return;
    }
    const existing_user = await userModel.findOne({ email });

    if (!existing_user) {
      res.status(404).json({
        status: "error",
        message: "user not found please register",
      });
    }
    const isMatch = await bcrypt.compare(password, existing_user.password);
    if (!isMatch) {
      res.status(500).json({
        status: "error",
        message: "Invalid Credintials",
      });
      return;
    }
    const secret = process.env.JWT_SECRET as string | undefined;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }
    const token = jwt.sign({ id: existing_user._id }, secret);
    const { password: _, ...userWithoutPassword } = existing_user.toObject();
    res.status(200).json({
      status: "success",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: "error",
      message: "Failed to login try again",
    });
  }
};
const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const existing_user = await userModel.findById(userId).select("-password");
    if (!existing_user) {
      res.status(404).json({
        status: "error",
        message: "No Profile user for this ID",
      });
      return;
    } else {
      res.status(200).json({
        status: "success",
        data: existing_user,
      });
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: "error",
      message: "Failed to get profile",
    });
  }
};
const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, address, gender, dob, phone } = req.body;
    const userId = (req as any).userId; // Retrieve userId from req
    console.log(userId);

    if (!userId) {
      res.status(401).json({ status: "error", message: "Unauthorized" });
      return;
    }
    const existing_user = await userModel.findById(userId).select("-password");
    if (!existing_user) {
      res.status(404).json({
        status: "error",
        message: "No user for this id",
      });
      return;
    }

    let imageUrl;
    const imageFile = req.file; // `req.file` contains the uploaded file
    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image", // Specifies that we're uploading an image
      });
      imageUrl = imageUpload.secure_url; // Get the URL of the uploaded image
      console.log("Image uploaded:", imageUpload);
    }

    const userData = {
      name,
      address: JSON.parse(address),
      gender,
      dob,
      phone,
      image: imageUrl || "Image not uploaded",
    };
    const updated_user = await userModel.findByIdAndUpdate(userId, userData, {
      new: true,
    });
    if (!updated_user) {
      res.status(400).json({
        status: "error",
        message: "Failed To Upate User",
      });
      return;
    }
    res.status(200).json({
      status: "success",
      data: updated_user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};
//API to book appointment
const bookAppointment = async (req: Request, res: Response) => {
  try {
    const { docId, slotDate, slotTime } = req.body;
    const { error } = addAppointmentValidationBody.validate({
      docId,
      slotDate,
      slotTime,
    });
    if (error) {
      console.log(error);
      res.status(400).json({ message: error.details[0].message });
      return;
    }
    const userId = (req as any).userId;
    const docData = await doctorModel.findById(docId).select("-password");
    if (!docData.available) {
      res.status(400).json({
        status: "error",
        message: "Doctor not available",
      });
      return;
    }
    let slots_booked = docData.slots_booked;
    //check for slot availability
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        res.status(400).json({
          status: "error",
          message: "Slot not available",
        });
        return;
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [];
      slots_booked[slotDate].push(slotTime);
    }
    const userData = await userModel.findById(userId).select("-password");
    delete docData.slots_booked;
    const appointmentData = {
      userId,
      docId,
      userData,
      docData,
      amount: docData.fees,
      slotTime,
      slotDate,
      date: Date.now(),
    };
    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });
    res.status(200).json({
      status: "success",
      message: "Appointment Booked",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};
const getMyAppointments = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const appointments = await appointmentModel.find({
      userId,
    });
    if (appointments.length === 0) {
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
      message: "Something went wrong",
    });
  }
};
const cancelAppointment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { appointmentId } = req.params;
    const appointmentData = await appointmentModel.findById(appointmentId);
    if (appointmentData.userId !== userId) {
      res.status(401).json({
        status: "error",
        message: "Unauthorized action",
      });
      return;
    }
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
const getCheckoutSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //get the currently appointment
  const userId = (req as any).userId;
  const { appointmentId } = req.params;

  const appointment = await appointmentModel.findById(appointmentId);
  try {
    const secret_key = process.env.STRIPE_SECRET_KEY as string;
    const frontendURL = process.env.FRONTEND_URL;
    console.log(secret_key);
    const stripe = new Stripe(secret_key);
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          price_data: {
            currency: "usd",
            product_data: {
              name: `Doctor: ${appointment.docData.name} | Patient: ${appointment.userData.name}`,
            },
            unit_amount: appointment.amount * 100, // Amount in cents (integer).
          },
          quantity: 1,
        },
      ],
      client_reference_id: appointmentId,
      mode: "payment",
      success_url: `${frontendURL}/my-appointments`,
      cancel_url: `${frontendURL}/appointment/${appointment.docId}/${appointment.docData.speciality}`,
    });
    if (!session) {
      res.status(400).json({
        status: "error",
        message: " failed to get the session",
      });
      return;
    }
    const updatedAppointment = await appointmentModel.findByIdAndUpdate(
      appointmentId,
      { payment: true },
      { new: true }
    );
    if (!updatedAppointment) {
      res.status(400).json({
        status: "error",
        message: "failed to update appointment",
      });
      return;
    }
    res.status(200).json({
      status: "success",
      session,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "something went wrong",
    });
  }
  //create checkout session
};

export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  getCheckoutSession,
};
