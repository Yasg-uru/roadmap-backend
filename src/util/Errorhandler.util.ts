import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
// ✅ Custom Error Handler Class
class Errorhandler extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message); // Pass message to built-in Error class
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const ErrorhandlerMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err instanceof Errorhandler) {
    return res.status(statusCode).json({ error: message });
  }

  if (err instanceof JsonWebTokenError) {
    statusCode = 401;
    message = "Invalid Token! Please log in again.";
  } else if (err instanceof TokenExpiredError) {
    statusCode = 401;
    message = "Token expired! Please log in again.";
  }

  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e: any) => e.message);
    message = `Validation Error: ${errors.join(", ")}`;
  }

  if (err.code === 11000 && err.keyValue) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate Key Error: '${field}' already exists.`;
  }

  if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  console.error("🚨 Error: ", err);
  return res.status(statusCode).json({ error: message });
};

export default Errorhandler;
