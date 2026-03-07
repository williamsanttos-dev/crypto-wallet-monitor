import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { IAuthService } from './interfaces/auth.service.interface';
import type { IAuthRepository } from './interfaces/auth.repository.interface';
import type { IHashProvider } from './providers/hash.provider.interface';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject('AuthRepository')
    private readonly repository: IAuthRepository,

    @Inject('HashProvider')
    private readonly hashProvider: IHashProvider,
  ) {}

  async register(data: CreateUserDto): Promise<void> {
    const userAlreadyExist = await this.repository.findUserByEmailAndUsername(
      data.email,
      data.username,
    );

    if (userAlreadyExist)
      throw new ConflictException('email or username already exist');

    const passwordHash = await this.hashProvider.hash(data.pass);

    await this.repository.create({
      email: data.email,
      passwordHash,
      username: data.username,
    });
  }
}
