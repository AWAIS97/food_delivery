import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { RegisterResponse } from './types/user.type';
import { RegisterDto } from './dto/user.dto';
import { UsersService } from './users.service';
import { Response } from 'express';
import { BadRequestException } from '@nestjs/common';
import { User } from './entities/user.entity';

@Resolver('User')
export class UserResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => RegisterResponse)
  async register(
    @Args('registerInput') registerDto: RegisterDto,
    @Context() context: { res: Response },
  ): Promise<RegisterResponse> {
    if (!registerDto.name || !registerDto.email || !registerDto.password) {
      throw new BadRequestException('Please fill all the required fields.');
    }

    const user = this.usersService.register(registerDto, context.res);
    return { user };
  }

  @Query(() => [User])
  async getUsers() {
    return this.usersService.getUsers();
  }
}
