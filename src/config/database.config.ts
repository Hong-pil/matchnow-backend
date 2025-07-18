// src/config/database.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';

export const getTypeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const config: DataSourceOptions = {
    type: 'mysql',
    host: configService.get<string>('MYSQL_HOST', 'localhost'),
    port: configService.get<number>('MYSQL_PORT', 3306),
    username: configService.get<string>('MYSQL_USERNAME', 'matchnow_user'),
    password: configService.get<string>('MYSQL_PASSWORD', 'matchnow0618!!!'),
    database: configService.get<string>('MYSQL_DATABASE', 'matchnow_dev'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: configService.get<string>('NODE_ENV') === 'development', // 프로덕션에서는 false
    logging: configService.get<string>('NODE_ENV') === 'development',
    timezone: '+09:00', // 한국 시간
    charset: 'utf8mb4',
    // MySQL 연결 옵션 수정
    extra: {
      connectionLimit: 10,
      acquireTimeout: 60000,
      timeout: 60000,
    },
  };

  console.log('🔍 TypeORM Config Generated:', {
    host: config.host,
    port: config.port,
    database: config.database,
    username: config.username,
  });

  return config;
};