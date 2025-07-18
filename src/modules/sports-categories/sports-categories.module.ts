import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SportsCategory, SportsCategorySchema } from './schemas/sports-category.schema';
import { SportsCategoriesController } from './controllers/sports-categories.controller';
import { SportsCategoriesMongodbRepository } from './repositories/sports-categories.mongodb.repository';
import { SportsCategoriesService } from './services/sports-categories.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: SportsCategory.name, schema: SportsCategorySchema }])],
  providers: [SportsCategoriesMongodbRepository, SportsCategoriesService],
  controllers: [SportsCategoriesController],
  exports: [SportsCategoriesService],
})
export class SportsCategoriesModule {}
