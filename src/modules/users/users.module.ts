import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaUserRepository } from './users.repository';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [
    { provide: 'UsersService', useClass: UsersService },
    { provide: 'UserRepository', useClass: PrismaUserRepository },
  ],
})
export class UsersModule {}
