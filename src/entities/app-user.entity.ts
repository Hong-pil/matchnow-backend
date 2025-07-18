// src/entities/app-user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum SocialProvider {
  KAKAO = 'kakao',
  GOOGLE = 'google',
  APPLE = 'apple',
}

export enum AppUserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Entity('app_users')
export class AppUser {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: '사용자 ID' })
  id: number;

  @Column({ unique: true, length: 100 })
  @ApiProperty({ example: 'user123@kakao', description: '소셜 로그인 고유 식별자' })
  socialId: string;

  @Column({
    type: 'enum',
    enum: SocialProvider,
  })
  @ApiProperty({ 
    example: SocialProvider.KAKAO, 
    description: '소셜 로그인 제공자',
    enum: SocialProvider 
  })
  provider: SocialProvider;

  @Column({ length: 100, nullable: true })
  @ApiProperty({ example: 'user@example.com', description: '이메일 (선택)' })
  email?: string;

  @Column({ length: 50 })
  @ApiProperty({ example: '홍길동', description: '사용자 이름' })
  name: string;

  @Column({ length: 100, nullable: true })
  @ApiProperty({ example: '길동이', description: '닉네임' })
  nickname?: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ example: 'https://profile.image.url', description: '프로필 이미지 URL' })
  profileImageUrl?: string;

  @Column({ type: 'date', nullable: true })
  @ApiProperty({ example: '1990-01-01', description: '생년월일' })
  birthDate?: Date;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  @ApiProperty({ 
    example: Gender.MALE, 
    description: '성별',
    enum: Gender 
  })
  gender?: Gender;

  @Column({ length: 20, nullable: true })
  @ApiProperty({ example: '010-1234-5678', description: '전화번호' })
  phoneNumber?: string;

  @Column({
    type: 'enum',
    enum: AppUserStatus,
    default: AppUserStatus.ACTIVE,
  })
  @ApiProperty({ 
    example: AppUserStatus.ACTIVE, 
    description: '사용자 상태',
    enum: AppUserStatus 
  })
  status: AppUserStatus;

  @Column({ type: 'datetime', nullable: true })
  @ApiProperty({ example: new Date(), description: '마지막 로그인 시간' })
  lastLoginAt?: Date;

  @Column({ type: 'varchar', length: 45, nullable: true })
  @ApiProperty({ example: '127.0.0.1', description: '마지막 로그인 IP' })
  lastLoginIp?: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ example: 'refresh_token_here', description: 'SNS 리프레시 토큰' })
  refreshToken?: string;

  @Column({ type: 'datetime', nullable: true })
  @ApiProperty({ example: new Date(), description: '토큰 만료 시간' })
  tokenExpiresAt?: Date;

  @CreateDateColumn()
  @ApiProperty({ example: new Date(), description: '생성일시' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ example: new Date(), description: '수정일시' })
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}