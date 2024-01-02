import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, RegisterDto } from './dto/user.dto';
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

    await this.emailsService.sendMail({
      email,
      subject: 'Activate you account!',
      template: './activation-email',
      name,
      activationCode,
    });

    //  await this.prismaService.user.create({
    //   data: { name, email, password: hashedPassword, phone_number },
    // });
     return { user, response };
  }

  // ------------------------------account activation----------------------------------
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
