import bodyParser from "body-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import routes from "./routes/index";
import serverless from "serverless-http";

const app: Application = express();
const allowedOrigins = [
  "https://medical-sage-iota.vercel.app",
  "https://medical-panel.vercel.app",
];
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//app.use(routes);
app.use("/.netlify/functions/app", routes);
export const handler = serverless(app);
export default app;
