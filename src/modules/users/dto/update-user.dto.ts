import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'User public username',
    example: 'john Doe',
  })
  @IsString()
  @Length(3, 100)
  username!: string;
}
