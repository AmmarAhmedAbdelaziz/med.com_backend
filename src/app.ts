import bodyParser from "body-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import routes from "./routes/index";
const app: Application = express();
const allowedOrigins = [
  "https://medical-sage-iota.vercel.app",
  "https://medical-panel.vercel.app",
];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(routes);

export default app;
