import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { JwtTokenPayload } from '../types';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;
    const token = authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const tokenPayload: JwtTokenPayload =
        await this.jwtService.verifyAsync(token);
      request.user = {
        userId: tokenPayload.sub,
        email: tokenPayload.email,
      };
      return true;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
