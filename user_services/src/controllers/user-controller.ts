import express from "express";
import { UserService } from "../services/user-service";
import { CreateUserRequest, LoginUserRequest } from "../models/user-model";
import { sendErrorResponse } from "../utils";

export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  register = async (req: express.Request, res: express.Response) => {
    try {
      const createUserRequest = req.body as CreateUserRequest;
      const createuserResponse = await this.userService.register(
        createUserRequest
      );

      res.status(200).json({
        data: createuserResponse,
      });
    } catch (err) {
      let errorMessage = "server error";

      if (err instanceof Error) errorMessage = err.message;

      sendErrorResponse(res, 200, errorMessage);
    }
  };

  login = async (req: express.Request, res: express.Response) => {
    try {
      const loginUserRequest = req.body as LoginUserRequest;
      const loginUserResponse = await this.userService.login(loginUserRequest);

      res.status(200).json({
        data: loginUserResponse,
      });
    } catch (err) {
      let errorMessage = "server error";

      if (err instanceof Error) errorMessage = err.message;

      console.error("failed to get user", err);

      sendErrorResponse(res, 200, errorMessage);
    }
  };
}
