import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from "./users.service";
import { AuthService } from "./auth.service";
import { User } from "./user.entity";

describe('UsersController', () => {
  type Users = User[];
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;
  let users: Users = [
    {
      id: 1,
      email: "dhwanik@email.com",
      password: "blahblah",
    } as User,
    {
      id: 2,
      email: "mario@email.com",
      password: "another",
    } as User,
    {
      id: 3,
      email: "mario@email.com",
      password: "anotherone",
    } as User,
  ];

  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id: number) => {
        const user: User = users.find(u => u.id === id);
        return Promise.resolve(user);
      },
      findAll: (email: string) => {
        const filteredUsers: Users = users.filter(u => u.email === email);
        return Promise.resolve(filteredUsers);
      },
      /* update: () => {},
      remove: () => {}, */
    };
    fakeAuthService = {
      signin: (email: string, password: string): Promise<User> => {
        const user: User = users.find(u => u.email === email && u.password === password);
        return Promise.resolve(user);
      },
      // signup: () => {},
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it("should return users with the given email", async () => {
    const foundUsers: Users = await controller.findAllUsers("mario@email.com");
    expect(foundUsers.length).toBe(2);
  });

  it("should return a user with the given id", async () => {
    const user: User = await controller.findOneUser("1");
    expect(user).toBeDefined();
    expect(user.email).toBe("dhwanik@email.com");
  });

  it("should throw error if the user is not found", async () => {
    try {
      await controller.findOneUser("1");
    } catch (error) {
      expect(error.message).toBe("User not found");
      return;
    }
  })

  it("should sign the user in and set user ID in session object", async () => {
    const session = { userId: null };
    const user: User = await controller.signIn({ email: "dhwanik@email.com", password: "blahblah" }, session);

    expect(user).toBeDefined();
    expect(user.id).toBe(1);
    expect(session.userId).toBe(user.id)
  });
});
