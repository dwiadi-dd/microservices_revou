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
    jwt.sign(payload, process.env.SECRET_KEY as string, (err, token) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(token as string);
    });
  });
};

export function verifyJwtToken(token: string): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    jwt.verify(token, process.env.SECRET_KEY as string, (err, payload) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(payload);
    });
  });
}

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

export function handleError(statusCode: number, errorMessage: string) {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    res.status(statusCode).json({
      success: false,
      data: [],
      error_message: errorMessage,
    });
  };
}

export const formatDateToMySQL = (isoString: string) => {
  const isoDate = new Date(isoString);
  const mysqlDate = isoDate.toISOString().slice(0, 19).replace("T", " ");
  return mysqlDate;
};

export function formatMysqlDatetime(date: Date): string {
  return date.toISOString().slice(0, 19).replace("T", " ");
}
