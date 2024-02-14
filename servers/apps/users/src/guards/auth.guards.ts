import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const { req } = gqlContext.getContext();

    const accessToken = req.headers.accesstoken as string;
    const refreshToken = req.headers.refreshtoken as string;

    if (!accessToken || !refreshToken) {
      throw new UnauthorizedException('Please login to access this resource!');
    }

    if (accessToken) {
      const decoded = this.jwtService.decode(accessToken);
      const expirationTime = decoded?.exp;

      if (expirationTime * 1000 < Date.now()) {
        await this.updateAccessToken(req);
      }
    }

    return true;
  }

  private async updateAccessToken(req: any): Promise<void> {
    try {
      const refreshTokenData = req.headers.refreshtoken as string;

      const decoded = this.jwtService.decode(refreshTokenData);
      const expirationTime = decoded.exp * 1000;

      if (expirationTime < Date.now()) {
        throw new UnauthorizedException(
          'Please login to access this resource!',
        );
      }

      const user = await this.prismaService.user.findUnique({
        where: {
          id: decoded.id,
        },
      });

      const newAccessToken = this.jwtService.sign(
        { id: user.id },
        {
          secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
          expiresIn: '5m',
        },
      );

      const newRefreshToken = this.jwtService.sign(
        { id: user.id },
        {
          secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
          expiresIn: '7d',
        },
      );

      req.accessToken = newAccessToken;
      req.refreshToken = newRefreshToken;
      req.user = user;
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}