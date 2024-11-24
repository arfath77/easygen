import { IsEmail, Matches } from 'class-validator';

export class PasswordDto {
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/, {
    message:
      'Password must be at least 8 characters long, contain at least one number, one uppercase letter, one lowercase letter, and one special character',
  })
  readonly password: string;
}

export class LoginDto extends PasswordDto {
  @IsEmail()
  readonly email: string;
}

export class RegisterDto extends LoginDto {
  readonly name: string;
}
