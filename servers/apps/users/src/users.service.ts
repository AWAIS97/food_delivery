import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, RegisterDto } from './dto/user.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import { Response } from 'express';

@Injectable()
export class UsersService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  // -----------------------------register user-----------------------------------
  async register(registerDto: RegisterDto, response: Response) {
    const { name, email, password } = registerDto;
    const isEmailExist = await this.prismaService.user.findUnique({
      where: { 
        email
       },
    });

    if(isEmailExist){
      throw new BadRequestException("Email already exists") 
    }
    const user = await this.prismaService.user.create({
      data: { name, email, password },
    });
    return { user, response };
  }

  // ------------------------------login user----------------------------------
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = {
      email,
      password,
    };
    return user;
  }

  async getUsers() {
    return this.prismaService.user.findMany({});
  }
}
