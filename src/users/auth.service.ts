import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { randomBytes, scryptSync as scrypt } from "crypto";
import { UsersService } from "./users.service";
import { User } from "./user.entity";

@Injectable()
export class AuthService {
  constructor (private usersService: UsersService) {}

  async signup (email: string, password: string): Promise<User> {
    // Check if email is alread in use
    const users = await this.usersService.findAll(email);
    if (users.length) {
      throw new BadRequestException("User already exists");
    }

    // Hash the user's password
    // Create salt
    const salt = randomBytes(8).toString("hex");

    // Create sant and password hash
    const hash = scrypt(password, salt, 32);

    // Join the hash and the salt
    const result = `${salt}.${hash.toString("hex")}`;

    // Create and save the user's record and return the user
    return this.usersService.create({ email, password: result });
  }

  async signin (email: string, password: string): Promise<User> {
    // Check if the user with the given email exists
    const [user]: User[] = await this.usersService.findAll(email);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Extract out the salt and the hash from user's password
    const [salt, storedHash]: string[] = user.password.split(".");

    // Create salt and password hash
    const hash = scrypt(password, salt, 32);

    // Check if the calculate hash and the stored hash are same
    if (hash.toString("hex") !== storedHash) {
      throw new BadRequestException("Incorrect password");
    }

    return user;
  }
}