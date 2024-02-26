import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { CreateFoodDto, DeleteFoodDto } from './dto/foods.dto';
import { Response } from 'express';

@Injectable()
export class FoodServices {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async createFood(createFoodDto: CreateFoodDto, req: any, response: Response) {
    try {
      const { name, description, price, estimatedPrice, category, images } =
        CreateFoodDto as Food;
      const restaurantId = req.restaurant?.id;
      return { message: 'Food Created Successfully!' };
    } catch (error) {
      return { message: error };
    }
  }

  async getLoggedInRestuarantFood() {}

  async deleteFood() {}
}
