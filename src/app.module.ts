// src/app.module.ts (업데이트)
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { ClsModule } from 'nestjs-cls';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { ClsStoreKey } from '@/common/constants/cls.constant';
import { getTypeOrmConfig } from '@/config/database.config';

import { AppController } from './app.controller';
import { AppHealthIndicator } from './app.health';
import { AppInitService } from './app.init.service';
import { UsersModule } from './modules/users/users.module';
import { SportsCategoriesModule } from './modules/sports-categories/sports-categories.module';
import { LeagueSeasonsModule } from './modules/league-seasons/league-seasons.module';
import { CountriesModule } from './modules/countries/countries.module';
import { LeaguesModule } from './modules/leagues/leagues.module';
import { PlayersModule } from './modules/players/players.module';
import { TeamsModule } from './modules/teams/teams.module';
import { GamesModule } from './modules/games/games.module';
import { BetsApiModule } from './modules/betsapi/betsapi.module';
import { FootballMatchesModule } from './modules/football-matches/football-matches.module'; // 새로 추가
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TerminusModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // 정적 파일 서빙 모듈 추가
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/admin',
    }),
    
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        setup: (cls, req, res) => {
          cls.set(ClsStoreKey.DATA_LOADERS, {});
          cls.set(ClsStoreKey.REQUEST, req);
          cls.set(ClsStoreKey.RESPONSE, res);
        },
      },
    }),
    
    // MongoDB 연결 (기존)
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('db.service.connection.uri') || 
                    configService.get<string>('MONGODB_URI') ||
                    process.env.MONGODB_URI || 
                    'mongodb://localhost:27017/match-now-dev';
        
        console.log('🔍 Final MongoDB URI:', uri);
        
        return {
          uri,
          autoCreate: true,
          autoIndex: false,
        };
      },
      inject: [ConfigService],
    }),
    
    // MySQL 연결 (신규)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getTypeOrmConfig,
    }),
    
    // 기존 모듈들
    UsersModule,
    SportsCategoriesModule,
    LeagueSeasonsModule,
    CountriesModule,
    LeaguesModule,
    PlayersModule,
    TeamsModule,
    GamesModule,
    BetsApiModule,
    FootballMatchesModule, // 새로 추가된 축구 경기 관리 모듈
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppHealthIndicator, AppInitService],
})
export class AppModule {}