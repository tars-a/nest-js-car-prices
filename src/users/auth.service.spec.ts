import { Test } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dtos/create-user.dto";
import { User } from "./user.entity";

let service: AuthService;
let fakeUsersService: Partial<UsersService>;

describe("AuthService", () => {
  let users: User[] = [];
  beforeEach(async () => {
    fakeUsersService = {
      findAll: (email: string): Promise<User[]> => {
        const filteredUsers: User[] = users.filter(user => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (userData: CreateUserDto): Promise<User> => {
        const id = Math.floor(Math.random() * 9999);
        const user: User = { id, email: userData.email, password: userData.password } as User;
        users.push(user);
        return Promise.resolve(user);
      }
    }

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService
        }
      ]
    }).compile();
  
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    users = [];
  })

  it("should create instance of AuthService", async () => {
    expect(service).toBeDefined();
  });

  it("should create a user with salted and hashed password", async () => {
    const user = await service.signup("dhwanik@email.com", "12345");
    const [salt, hash] = user.password.split(".");
  
    expect(user.password).not.toBe("12345");
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it("should throw an error for already existing user", async () => {
    await service.signup("dhwanik@email.com", "12345");
    try {
      return await service.signup("dhwanik@email.com", "12345");
    } catch (error) {
      expect(error.message).toBe("User already exists");
      return;
    }
  })

  it("should throw an error for non existing user", async () => {
    try {
      return await service.signin("dhwanik@email.com", "12345");
    } catch (error) {
      expect(error.message).toBe("User not found");
      return;
    }
  });

  it("should throw an error for incorrect password", async () => {
    await service.signup("dhwanik@email.com", "123456");
    try {
      return await service.signin("dhwanik@email.com", "12345");
    } catch (error) {
      expect(error.message).toBe("Incorrect password");
      return;
    }
  });

  it("should sign in the user and return the user data", async () => {
    await service.signup("dhwanik1@email.com", "12345");

    const user = await service.signin("dhwanik1@email.com", "12345");
    expect(user).toBeDefined();
  });
});
