import { Controller, Post, Body, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/index.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 1000 } })
  @Post('register')
  register(@Body() body: RegisterDto) {
    this.logger.log(`Registering user with email: ${body.email}`);
    return this.authService.register(body);
  }

  @Throttle({ default: { limit: 5, ttl: 1000 } })
  @Post('login')
  login(@Body() body: LoginDto) {
    this.logger.log(`login request received for email: ${body.email}`);
    return this.authService.login(body);
  }
}
