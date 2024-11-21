import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

// Admin authentication middleware
const authAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    // Check if the Authorization header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        status: "error",
        message: "Not Authorized. Please log in again.",
      });
      return;
    }

    // Extract the token by splitting the string
    const token = authHeader.split(" ")[1];

    const token_decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    // Optionally attach the decoded token to the request for further use

    if (
      !process.env.ADMIN_EMAIL ||
      !process.env.ADMIN_PASSWORD ||
      token_decoded !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD
    ) {
      res.status(401).json({ status: "error", message: "Not Authorized" });
      return;
    }

    next();
  } catch (error) {
    res
      .status(401)
      .json({ status: "error", message: "Failed to authenticate" });
  }
};

export default authAdmin;
