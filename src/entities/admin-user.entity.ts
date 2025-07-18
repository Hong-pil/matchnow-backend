// src/entities/admin-user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

export enum AdminStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('admin_users')
export class AdminUser {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: '관리자 ID' })
  id: number;

  @Column({ unique: true, length: 50 })
  @ApiProperty({ example: 'admin@matchnow.com', description: '관리자 이메일' })
  email: string;

  @Column({ length: 255 })
  password: string; // 해시된 비밀번호

  @Column({ length: 50 })
  @ApiProperty({ example: '관리자', description: '관리자 이름' })
  name: string;

  @Column({
    type: 'enum',
    enum: AdminRole,
    default: AdminRole.MODERATOR,
  })
  @ApiProperty({ 
    example: AdminRole.ADMIN, 
    description: '관리자 권한',
    enum: AdminRole 
  })
  role: AdminRole;

  @Column({
    type: 'enum',
    enum: AdminStatus,
    default: AdminStatus.ACTIVE,
  })
  @ApiProperty({ 
    example: AdminStatus.ACTIVE, 
    description: '관리자 상태',
    enum: AdminStatus 
  })
  status: AdminStatus;

  @Column({ type: 'datetime', nullable: true })
  @ApiProperty({ example: new Date(), description: '마지막 로그인 시간' })
  lastLoginAt?: Date;

  @Column({ type: 'varchar', length: 45, nullable: true })
  @ApiProperty({ example: '127.0.0.1', description: '마지막 로그인 IP' })
  lastLoginIp?: string;

  @CreateDateColumn()
  @ApiProperty({ example: new Date(), description: '생성일시' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ example: new Date(), description: '수정일시' })
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}