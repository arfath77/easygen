import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../schemas/user.schema';
import { LoginDto, RegisterDto } from './dto/index.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async register(body: RegisterDto) {
    try {
      const { email, password, name } = body;
      const hashedPassword = await bcrypt.hash(password, 10);

      // check if user exists
      const userExists = await this.userModel.findOne({ email });

      if (userExists) {
        this.logger.error(`User with email: ${email} already exists`);
        throw new ConflictException('User with this email already exists');
      }

      const userData = new this.userModel({
        email,
        password: hashedPassword,
        name,
      });
      const newUser = await userData.save();
      this.logger.log(`User registered successfully with email: ${email}`);
      const payload = {
        email: newUser.email,
        id: newUser._id,
        name: newUser.name,
      };
      return {
        accessToken: this.jwtService.sign(payload),
      };
    } catch (error) {
      this.logger.error(
        `Error registering user with email: ${body.email} with error: ${error}`,
      );
      throw new InternalServerErrorException(error);
    }
  }

  async login(body: LoginDto) {
    try {
      const { email, password } = body;
      const user = await this.userModel.findOne({ email });
      if (!user) {
        this.logger.error(`User with email: ${email} not found`);
        throw new UnauthorizedException({ message: 'Account does not exists' });
      }
      if (!(await bcrypt.compare(password, user.password))) {
        this.logger.error(`Invalid login attempt for email: ${email}`);
        throw new UnauthorizedException({
          message: 'Invalid credentials',
        });
      }
      this.logger.log(`User logged in successfully with email: ${email}`);
      const payload = { email: user.email, id: user._id, name: user.name };
      return {
        accessToken: this.jwtService.sign(payload),
      };
    } catch (error) {
      this.logger.error('login error', error);
      throw new InternalServerErrorException(error);
    }
  }
}
