import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });
const DATABASE_URL = process.env.DATABASE_URL as string;
const connectDB = async () => {
  await mongoose
    .connect(DATABASE_URL)
    .then((res) => {
      console.log("Database connected successfull");
    })
    .catch((err) => console.log("Connection Failed : ", err));
};
export default connectDB;
