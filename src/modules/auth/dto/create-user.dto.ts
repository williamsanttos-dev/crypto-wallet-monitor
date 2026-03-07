import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

type valueInput = {
  value: string;
};

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }: valueInput) => value.toLowerCase())
  @ApiProperty({
    example: 'johndoe123@example.com',
  })
  email: string;

  @IsString()
  @Length(1, 100)
  @ApiProperty({
    example: 'John Doe',
  })
  username: string;

  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message:
      'password must contain uppercase letters, lowercase letters, numbers and at least 8 characters',
  })
  @ApiProperty({
    example: 'John2Doe62',
  })
  pass: string;
}
