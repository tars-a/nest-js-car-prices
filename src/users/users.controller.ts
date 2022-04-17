import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Query,
  Delete,
  Session,
  UseGuards,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Serialize } from '../interceptors/serialize.interceptor';
import { CreateUserDto } from "./dtos/create-user.dto";
import { UpdateUserDto } from "./dtos/update-user.dto";
import { User } from './user.entity';
import { UsersService } from "./users.service";
import { AuthService } from "./auth.service";
import { UserDto } from "./dtos/user.dto";
import { CurrentUser } from "./decorators/current-user.decorator";
import { AuthGuard } from "../guards/auth.guard";

@Controller('auth')
@Serialize(UserDto)
export class UsersController {
  constructor (
    private usersService: UsersService,
    private authService: AuthService
  ) {}

  @Get("/get-user")
  @UseGuards(AuthGuard)
  getUser (@CurrentUser() user: User): User {
    if (!user) {
      throw new UnauthorizedException("You're not signed in")
    }

    return user;
  }

  @Post("/signup")
  async signUp (@Body() body: CreateUserDto, @Session() session: any): Promise<User> {
    const user = await this.authService.signup(body.email, body.password);
    session.userId = user.id;
    return user;
  }

  @Post("/signin")
  async signIn (@Body() body: CreateUserDto, @Session() session: any): Promise<User> {
    const user = await this.authService.signin(body.email, body.password);
    session.userId = user.id;
    return user;
  }

  @Post("/signout")
  signOut (@Session() session: any): void {
    session.userId = undefined;
  }

  @Get("/:id")
  async findOneUser (@Param("id") id: string): Promise<User> {
    const user = await this.usersService.findOne(parseInt(id));

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  @Get()
  findAllUsers (@Query("email") email: string): Promise<User[]> {
    return this.usersService.findAll(email);
  }

  @Delete("/:id")
  removeUser (@Param("id") id: string): Promise<User> {
    return this.usersService.remove(parseInt(id));
  }

  @Patch("/:id")
  updateUser (@Param("id") id: string, @Body() body: UpdateUserDto): Promise<User> {
    return this.usersService.update(parseInt(id), body);
  }
}
