import express, { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });
import http from "http";
import app from "./app";
import connectDB from "./DB/db";
// Load environment variables from .env file

const server = http.createServer(app);
connectDB();
const port = process.env.PORT;
server.listen(port, () => {
  console.log(`App running on port : ${port}`);
});
