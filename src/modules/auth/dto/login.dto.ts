import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, Matches } from 'class-validator';

type valueInput = {
  value: string;
};

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }: valueInput) => value.toLowerCase())
  @ApiProperty({
    example: 'johndoe123@example.com',
  })
  email: string;

  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message: 'Invalid password. The password does not match the pattern.',
  })
  @ApiProperty({
    example: 'John2Doe62',
  })
  pass: string;
}
