import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type PlayerDocument = HydratedDocument<Player>;

@Schema({ collection: 'players', timestamps: true })
export class Player {
  @ApiProperty({ example: '박지성' })
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty({ example: 'Jisung Park' })
  @Prop({ type: String, required: true })
  nameEn: string;

  @ApiProperty({ example: 'midfielder' })
  @Prop({ type: String, required: false })
  position?: string;

  @ApiProperty({ example: 'none' })
  @Prop({ type: String, required: false })
  healthStatus?: string;

  @ApiProperty({ example: ['https://imageurl.com'] })
  @Prop({ type: [String], required: false })
  photos?: string[];

  @ApiProperty({ example: new Date() })
  createdAt: Date;
  @ApiProperty({ example: new Date() })
  updatedAt: Date;

  @ApiProperty({ example: new Date() })
  @Prop({ type: Date, required: false })
  deletedAt?: Date;
}

export const PlayerSchema = SchemaFactory.createForClass(Player);
