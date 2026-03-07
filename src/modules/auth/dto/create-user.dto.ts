import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

type valueInput = {
  value: string;
};

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }: valueInput) => value.toLowerCase())
  email: string;

  @IsString()
  @Length(1, 100)
  username: string;

  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message:
      'password must contain uppercase letters, lowercase letters, numbers and at least 8 characters',
  })
  pass: string;
}
