/* eslint-disable secure-coding/no-hardcoded-credentials */

import { ApiProperty } from '@nestjs/swagger';

import { Role } from 'src/enums/role.enum';
export class UserEntity {
  @ApiProperty({
    description: 'User unique identifier',

    example: '2d4d9b58-0d89-4f6a-b7f6-3f6ef1f26f1d',
  })
  id!: string;

  @ApiProperty({
    description: 'User email address',
    example: 'admin@email.com',
  })
  email!: string;

  @ApiProperty({
    description: 'User public username',
    example: 'john Doe',
  })
  username!: string;

  @ApiProperty({
    description: 'User access role',
    enum: Role,
    example: Role.ADMIN,
  })
  role!: Role;

  @ApiProperty({
    description: 'Date when the user was created',
    example: '2026-03-01T10:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Date when the user was last updated',
    example: '2026-03-02T10:00:00.000Z',
  })
  updatedAt!: Date;
}
