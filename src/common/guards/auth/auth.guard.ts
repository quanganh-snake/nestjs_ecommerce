import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from 'src/modules/auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private readonly authService: AuthService) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken = request.headers.authorization?.split('Bearer ')[1];

    if (!accessToken) {
      throw new UnauthorizedException('No token provided');
    }

    const user = await this.authService.verifyToken(accessToken);
    if(user) {
      request.user = user;
      return true;
    }

    throw new UnauthorizedException('Tài khoản chưa được kích hoạt!');
  }
}
