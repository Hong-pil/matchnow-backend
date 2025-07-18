import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type SportsCategoryDocument = HydratedDocument<SportsCategory>;

@Schema({ collection: 'sports-categories', timestamps: true })
export class SportsCategory {
  @ApiProperty({ example: '축구', description: 'unique 한 값만 입력 가능' })
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty({ example: 'football' })
  @Prop({ type: String, required: true })
  nameEn: string;

  @ApiProperty({ example: new Date() })
  createdAt: Date;
  @ApiProperty({ example: new Date() })
  updatedAt: Date;

  @ApiProperty({ example: new Date() })
  @Prop({ type: Date, required: false })
  deletedAt?: Date;
}

export const SportsCategorySchema = SchemaFactory.createForClass(SportsCategory);
