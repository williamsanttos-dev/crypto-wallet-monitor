/* eslint-disable jwt/require-expiration, jwt/no-weak-secret, jwt/no-hardcoded-secret */
// All requirements was added in TokenProvider file (src/modules/auth/provider/token.provider.ts)

import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';

import {
  IAuthService,
  TokensPayload,
} from './interfaces/auth.service.interface';
import type { IAuthRepository } from './interfaces/auth.repository.interface';
import type { IHashProvider } from './providers/hash.provider.interface';
import type { ITokenProvider } from './providers/token.provider.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject('AuthRepository')
    private readonly repository: IAuthRepository,

    @Inject('HashProvider')
    private readonly hashProvider: IHashProvider,

    @Inject('TokenProvider')
    private readonly tokenProvider: ITokenProvider,
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

  async login(data: LoginDto): Promise<TokensPayload> {
    const result = await this.repository.findUserByEmail(data.email);

    if (
      !result ||
      !(await this.hashProvider.compare(data.pass, result.passwordHash))
    )
      throw new BadRequestException('Invalid credentials');

    const [accessToken] = [
      this.tokenProvider.sign({ sub: result.id }, 'access'),
    ];

    return { accessToken };
  }
}
