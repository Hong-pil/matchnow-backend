import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { UserAdmin, ProviderName, UserStatus } from '../constants/user.constants';

export type UserDocument = HydratedDocument<User>;

@Schema({ _id: false })
export class UserProvider {
  @Prop({ type: String, required: true })
  id: string;

  @Prop({
    type: String,
    required: true,
    enum: [ProviderName.NAVER, ProviderName.KAKAO, ProviderName.GOOGLE, ProviderName.APPLE],
  })
  name: ProviderName;

  @Prop({ type: String, required: false })
  accessToken?: string;

  @Prop({ type: String, required: false })
  refreshToken?: string;

  @Prop({ type: Date, required: false })
  tokenExpiresAt?: Date;

  @Prop({ type: Date, required: false })
  tokenCreatedAt?: Date;

  @Prop({ type: Date, required: false })
  tokenUpdatedAt?: Date;
}

@Schema({ collection: 'users', timestamps: true })
export class User {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: false, enum: [UserAdmin.ROOT, UserAdmin.NORMAL] })
  admin?: UserAdmin;

  @Prop({ type: UserProvider, required: false })
  provider?: UserProvider;

  @Prop({ type: String, required: true, enum: [UserStatus.ACTIVE] })
  status: UserStatus;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
