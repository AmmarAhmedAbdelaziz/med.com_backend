import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// User authentication middleware
const authUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

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

    // Check if the decoded token is of type JwtPayload and contains an 'id' property
    if (typeof token_decoded === "object" && "id" in token_decoded) {
      (req as any).userId = (token_decoded as JwtPayload).id;
      next();
    } else {
      res.status(401).json({ status: "error", message: "Invalid token" });
    }
  } catch (error) {
    res
      .status(401)
      .json({ status: "error", message: "Failed to authenticate" });
  }
};

export default authUser;
