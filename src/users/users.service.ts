import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { CreateUserDto } from './dtos/create-user.dto';

@Injectable()
export class UsersService {
  constructor (@InjectRepository(User) private repository: Repository<User>) {}

  create (userData: CreateUserDto): Promise<User> {
    const user = this.repository.create(userData);
    return this.repository.save(user);
  }

  findOne (id: number): Promise<User> {
    if (!id) {
      return null;
    }

    return this.repository.findOne(id);
  }

  findAll (email: string): Promise<User[]> {
    return this.repository.find({ email });
  }

  async update (id: number, attributes: Partial<User>): Promise<User> {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    Object.assign(user, attributes);
    return this.repository.save(user);
  }

  async remove (id: number): Promise<User> {
    const user = await this.findOne(id);

    if (!user) {
      console.log("blah", user)
      throw new BadRequestException("User may have already been deleted");
    }

    return this.repository.remove(user);
  }
}
