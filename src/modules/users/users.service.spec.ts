import { Test, TestingModule } from '@nestjs/testing';

import { UsersService } from './users.service';
import { IUserRepository } from './interfaces/user.repository.interface';
import { Role } from 'src/enums/role.enum';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserRepository: jest.Mocked<IUserRepository> = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: 'UserRepository',
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all users from repository', async () => {
    const offset = 0;
    const limit = 20;
    const users = [
      {
        id: 'user-id-1',
        email: 'admin@email.com',
        username: 'admin',
        role: Role.ADMIN,
        createdAt: new Date('2026-03-01T10:00:00.000Z'),
        updatedAt: new Date('2026-03-02T10:00:00.000Z'),
      },
    ];

    mockUserRepository.findAll.mockResolvedValue(users);

    await expect(service.findAll(offset, limit)).resolves.toEqual(users);
    expect(mockUserRepository.findAll).toHaveBeenCalledTimes(1);
    expect(mockUserRepository.findAll).toHaveBeenCalledWith(offset, limit);
  });
});
