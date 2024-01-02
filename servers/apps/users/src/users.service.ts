import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt';
import { LoginDto, RegisterDto, ActivationDto } from './dto/user.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { EmailService } from './email/email.service';

interface UserDataInterface {
  name: string;
  email: string;
  password: string;
  phone_number: number;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly emailsService: EmailService,
  ) {}

  // -----------------------------register user-----------------------------------
  async register(registerDto: RegisterDto, response: Response) {
    const { name, email, password, phone_number } = registerDto;
    const isEmailExist = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (isEmailExist) {
      throw new BadRequestException('Email already exists');
    }

    const isPhoneNumberExist = await this.prismaService.user.findUnique({
      where: {
        phone_number,
      },
    });

    if (isPhoneNumberExist) {
      throw new BadRequestException('Phone number already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = { name, email, password: hashedPassword, phone_number };
    const activationToken = await this.createActivationToken(user);
    const activationCode = activationToken.activationCode;
    const activation_token = activationToken.token;

    await this.emailsService.sendMail({
      email,
      subject: 'Activate you account!',
      template: './activation-email',
      name,
      activationCode,
    });
    return { activation_token, response };
  }

  // ------------------------------activation token----------------------------------
  async createActivationToken(user: UserDataInterface) {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const token = this.jwtService.sign(
      {
        user,
        activationCode,
      },
      {
        secret: this.configService.get<string>('ACTIVATION_SECRET'),
        expiresIn: '5m',
      },
    );
    return { token, activationCode };
  }

  // ------------------------------activate user----------------------------------
  async activateUser(activationDto: ActivationDto, response: Response) {
    const { activationCode, activationToken } = activationDto;

    const newUser: { user: UserDataInterface; activationCode: string } =
      this.jwtService.verify(activationToken, {
        secret: this.configService.get<string>('ACTIVATION_SECRET'),
      } as JwtVerifyOptions) as {
        user: UserDataInterface;
        activationCode: string;
      };

    if (newUser.activationCode !== activationCode) {
      throw new BadRequestException('Invalid activation code');
    }

    const { name, email, password, phone_number } = newUser.user;

    const existUser = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (existUser) {
      throw new BadRequestException('User already exist with this email!');
    }

    const user = await this.prismaService.user.create({
      data: {
        name,
        email,
        password,
        phone_number,
      },
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
