import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type CountryDocument = HydratedDocument<Country>;

@Schema({ collection: 'countries', timestamps: true })
export class Country {
  @ApiProperty({ example: '대한민국', description: 'unique 한 값만 입력 가능' })
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty({ example: new Date() })
  createdAt: Date;
  @ApiProperty({ example: new Date() })
  updatedAt: Date;

  @ApiProperty({ example: new Date() })
  @Prop({ type: Date, required: false })
  deletedAt?: Date;
}

export const CountrySchema = SchemaFactory.createForClass(Country);
