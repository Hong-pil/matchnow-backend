// src/modules/betsapi/betsapi.module.ts (업데이트)
import { Module } from '@nestjs/common';

import { BetsApiService } from './services/betsapi.service';
import { EnhancedBetsApiService } from './services/enhanced-betsapi.service';
import { BetsApiController } from './controllers/betsapi.controller';
import { EnhancedBetsApiController } from './controllers/enhanced-betsapi.controller';
import { FootballMatchesModule } from '../football-matches/football-matches.module';

@Module({
  imports: [FootballMatchesModule], // FootballMatchesModule 추가
  providers: [
    BetsApiService,
    EnhancedBetsApiService, // 새로 추가된 Enhanced 서비스
  ],
  controllers: [
    BetsApiController,
    EnhancedBetsApiController, // 새로 추가된 Enhanced 컨트롤러
  ],
  exports: [
    BetsApiService,
    EnhancedBetsApiService, // Enhanced 서비스도 export
  ],
})
export class BetsApiModule {}