import exp from "constants";
import express, { NextFunction } from "express";
import jwt from "jsonwebtoken";
export const generateJwtToken = (userId: number): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const currentDate = new Date();
    const fiveMinutes = currentDate.setMinutes(currentDate.getMinutes() + 5);
    const payload = {
      sub: userId,
      exp: Math.floor(fiveMinutes / 1000),
    };
    jwt.sign(payload, "ini_secret_kematian", (err, token) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(token as string);
    });
  });
};

export const sendResponse = (
  res: express.Response,
  code: number,
  success: boolean,
  data: any,
  errorMessage: string
) => {
  res.status(code).json({
    success,
    data,
    error_message: errorMessage,
  });
};

export const successResponse = (
  res: express.Response,
  data: any,
  errorMessage: string
) => {
  res.status(200).json({
    success: true,
    data: data,
    error_message: errorMessage,
  });
};

interface ErrorStatus extends Error {
  status: number;
}

export const errorRes = async (
  err: ErrorStatus,
  req: express.Request,
  res: express.Response,
  next: NextFunction
) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong";
  const errStack = err.stack;

  if (status >= 500) {
    console.error(errStack);
  }

  res.status(status).json({
    success: false,
    status: status,
    message: message,
  });
};
