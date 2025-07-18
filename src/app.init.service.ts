// src/app.init.service.ts
import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { AdminAuthService } from './auth/services/admin-auth.service';

@Injectable()
export class AppInitService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AppInitService.name);

  constructor(private readonly adminAuthService: AdminAuthService) {}

  async onApplicationBootstrap() {
    this.logger.log('🚀 애플리케이션 초기화 시작');

    try {
      // 슈퍼 관리자 계정 초기화
      await this.adminAuthService.createSuperAdmin();
      
      this.logger.log('✅ 애플리케이션 초기화 완료');
    } catch (error) {
      this.logger.error('❌ 애플리케이션 초기화 실패:', error);
    }
  }
}