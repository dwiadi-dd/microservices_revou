import express from "express";
import { verifyJwtToken } from "../utils";

export const authenticationMiddleware = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      throw new Error("unauthorized");
    }

    const token = authorizationHeader.split("Bearer ")[1];
    const payload = await verifyJwtToken(token);
    if (!payload) {
      throw new Error("unauthorized");
    }

    req.app.locals.userId = payload.sub;
    req.app.locals.role = payload.role;
    req.app.locals.name = payload.name;
    req.app.locals.email = payload.email;

    next();
  } catch (e) {
    res.status(401).json({
      error: "unauthorized",
    });
  }
};

export const authorizationMiddleware = (role: string) => {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (req.app.locals.role !== role) {
      res.status(403).json({
        error: "Forbidden",
      });
      return;
    }

    next();
  };
};
