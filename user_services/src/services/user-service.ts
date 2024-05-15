import bcrypt from "bcrypt";
import {
  CreateUserRequest,
  CreateUserResponse,
  LoginUserRequest,
  LoginUserResponse,
} from "../models/user-model";

import { UserRepository } from "../repositories/user-repository";
import { generateJwtToken } from "../utils";
import { onUserAction, sendToQueue } from "../consumer/user-consumer";

export class UserService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async register(
    createUserRequest: CreateUserRequest
  ): Promise<CreateUserResponse> {
    const hashedPassword = await bcrypt.hash(createUserRequest.password, 10);
    const createdUserId = await this.userRepository.create({
      id: 0,
      email: createUserRequest.email,
      password: hashedPassword,
      name: createUserRequest.name,
      role: "user",
    });
    const jwtToken = await generateJwtToken(createdUserId);
    // const msg = `User ${createUserRequest.email} has been created`;
    // onUserAction(msg);

    return {
      token: jwtToken,
    };
  }

  async login(loginUserRequest: LoginUserRequest): Promise<LoginUserResponse> {
    const user = await this.userRepository.getByEmail(loginUserRequest.email);

    const isPasswordMatch = await bcrypt.compare(
      loginUserRequest.password,
      user.password
    );
    if (!isPasswordMatch) {
      throw new Error("invalid email or password");
    }

    const jwtToken = await generateJwtToken(user);
    // const msg = `User ${loginUserRequest.email} is loggin`;
    // onUserAction(msg);
    return {
      token: jwtToken,
    };
  }
}
