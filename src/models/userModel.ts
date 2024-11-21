import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String },
  address: { type: Object, default: { line1: "", line2: "" } },
  gender: { type: String },
  dob: { type: String },
  phone: { type: String },
});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;
