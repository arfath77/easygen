import {
  HttpException,
  NestMiddleware,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

/**
 * Middleware get account details from API
 */
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  private API_KEY = this.configService.get<string>('API_KEY');

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const headers = req.headers as unknown as Record<string, string>;
      const token = headers['X-API-KEY'] || headers['x-api-key'];
      if (!token || token !== this.API_KEY) {
        throw new HttpException(
          'Invalid `X-API-KEY` provided',
          HttpStatus.UNAUTHORIZED,
        );
      }
      next();
    } catch (e) {
      console.log('error', e);
      throw new InternalServerErrorException(e);
    }
  }
}
