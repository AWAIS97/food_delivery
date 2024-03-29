import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  RegisterResponse,
  ActivationResponse,
  LoginResponse,
  LogoutResponse,
  ForgotPasswordResponse,
  ResetPasswordResponse
} from './types/user.type';
import { RegisterDto, ActivationDto, LoginDto,ForgotPasswordDto, ResetPasswordDto  } from './dto/user.dto';
import { UsersService } from './users.service';
import { Response } from 'express';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { User } from './entities/user.entity';
import { AuthGuard } from './guards/auth.guards';

@Resolver('User')
export class UserResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => RegisterResponse)
  async register(
    @Args('registerDto') registerDto: RegisterDto,
    @Context() context: { res: Response },
  ): Promise<RegisterResponse> {
    if (
      !registerDto.name ||
      !registerDto.email ||
      !registerDto.password ||
      !registerDto.phone_number
    ) {
      throw new BadRequestException('Please fill all the required fields.');
    }

    const { activation_token } = await this.usersService.register(
      registerDto,
      context.res,
    );
    return { activation_token };
  }

  @Mutation(() => ActivationResponse)
  async activateUser(
    @Args('activationDto') activationDto: ActivationDto,
    @Context() context: { res: Response },
  ): Promise<ActivationResponse> {    
    return await this.usersService.activateUser(activationDto, context.res);
  }

  @Mutation(() => LoginResponse)
  async Login(
    @Args('loginDto') loginDto: LoginDto,
  ): Promise<LoginResponse> {
    return await this.usersService.login(loginDto);
  }

  @Query(() => LoginResponse)
  @UseGuards(AuthGuard)
  async getLoggedInUser(@Context() context: { req: Request }) {
    return await this.usersService.getLoggedInUser(context.req);
  }

  @Mutation(() => ForgotPasswordResponse)
  async forgotPassword(
    @Args('forgotPasswordDto') forgotPasswordDto: ForgotPasswordDto,
  ): Promise<ForgotPasswordResponse> {
    return await this.usersService.forgotPassword(forgotPasswordDto);
  }

  @Mutation(() => ResetPasswordResponse)
  async resetPassword(
    @Args('resetPasswordDto') resetPasswordDto: ResetPasswordDto,
  ): Promise<ResetPasswordResponse> {
    return await this.usersService.resetPassword(resetPasswordDto);
  }

  @Query(() => LogoutResponse)
  @UseGuards(AuthGuard)
  async LogoutUser(@Context() context: { req: Request }) {
    return await this.usersService.LogoutUser(context.req);
  }

  @Query(() => [User])
  async getUsers() {
    return this.usersService.getUsers();
  }
}
