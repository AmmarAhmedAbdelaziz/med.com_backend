import bodyParser from "body-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import routes from "./routes/index";
const app: Application = express();
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(routes);

export default app;
