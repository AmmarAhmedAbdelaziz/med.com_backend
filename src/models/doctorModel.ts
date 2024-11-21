import mongoose from "mongoose";
const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String },
    speciality: { type: String },
    degree: { type: String },
    experience: { type: String },
    about: { type: String },
    available: { type: Boolean },
    fees: { type: Number },
    address: { type: Object, default: { line1: "", line2: "" } },
    date: { type: Number, default: Date.now() },
    slots_booked: { type: Object, default: {} },
  },
  { minimize: false }
);

const doctorModel =
  mongoose.models.doctor || mongoose.model("doctor", doctorSchema);
export default doctorModel;
