import bcrypt from "bcrypt";
import {
  CreateUserRequest,
  CreateUserResponse,
  LoginUserRequest,
  LoginUserResponse,
} from "../models/user-model";

import { UserRepository } from "../repositories/user-repository";
import { generateJwtToken } from "../utils";

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
    return {
      token: jwtToken,
    };
  }
}
