// src/main.ts (백엔드 전용으로 수정)
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';
import helmet from 'helmet';
import * as hpp from 'hpp';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // CORS 설정 (프론트엔드 서버 주소 허용)
  app.enableCors({
    origin: [
      'http://localhost:3000',      // 프론트엔드 개발 서버
      'http://localhost',           // 프론트엔드 프로덕션
      'http://175.126.95.157:3000', // 프론트엔드 개발 서버 (외부)
      'http://175.126.95.157',      // 프론트엔드 프로덕션 (외부)
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // 개발 환경에서만 Swagger 활성화
  if (process.env.NODE_ENV !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(process.env.APP_NAME || 'Match Now API')
      .setDescription('Match Now API 문서')
      .setVersion('1.0')
      .addBearerAuth() // JWT 인증 추가
      .build();
    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, swaggerDocument, {
      jsonDocumentUrl: 'api-json',
    });
  }

  // 루트 경로 API 정보
  app.use('/', (req, res, next) => {
    if (req.path === '/') {
      res.json({ 
        message: 'Match Now API Server (Backend Only)', 
        status: 'running',
        timestamp: new Date().toISOString(),
        endpoints: {
          health: '/health',
          api: '/api',
          docs: '/api',
        },
        frontend: {
          development: 'http://localhost:3000',
          production: 'http://175.126.95.157:3000'
        }
      });
    } else {
      next();
    }
  });

  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  app.use(compression());

  // 프로덕션에서만 보안 미들웨어 적용
  if (process.env.NODE_ENV === 'production') {
    app.use(hpp());
    app.use(helmet());
  }

  const port = process.env.PORT || 4011;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Backend API Server: ${await app.getUrl()}`);
  console.log(`📚 API Documentation: ${await app.getUrl()}/api`);
  console.log(`🌐 Frontend Dev Server: http://localhost:3000`);
}
void bootstrap();