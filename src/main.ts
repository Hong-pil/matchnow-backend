// src/main.ts (Express import 제거, NestJS 내장 기능 사용)
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';
import * as path from 'path';
import * as fs from 'fs';
import helmet from 'helmet';
import * as hpp from 'hpp';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // CORS 설정
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:4011',
      'http://localhost',
      'http://127.0.0.1:4011',
      'http://175.126.95.157:4011',
      'http://175.126.95.157',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Global Exception Filter 적용
  app.useGlobalFilters(new HttpExceptionFilter());

  // ValidationPipe 설정
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: false,
    disableErrorMessages: false,
    exceptionFactory: (errors) => {
      const message = errors.map(error => 
        Object.values(error.constraints || {}).join(', ')
      ).join('; ');
      return new BadRequestException(`Validation failed: ${message}`);
    }
  }));

  // 기본 미들웨어들
  app.use(cookieParser());
  app.use(compression());

  if (process.env.NODE_ENV === 'production') {
    app.use(hpp());
    app.use(helmet({
      contentSecurityPolicy: false,
    }));
  }

  // 프론트엔드 경로 설정
  const frontendPath = path.resolve(process.cwd(), '../matchnow-admin-web/src');
  console.log(`🗂️ Frontend 경로: ${frontendPath}`);

  // 경로 존재 확인
  if (fs.existsSync(frontendPath)) {
    console.log('✅ Frontend 경로 확인됨');
  } else {
    console.warn('⚠️ Frontend 경로 없음:', frontendPath);
    console.log('📝 관리자 페이지는 사용할 수 없지만 API는 정상 작동합니다.');
  }

  // 정적 파일 서빙을 위한 미들웨어 (Express import 없이)
  app.use('/admin', (req, res, next) => {
    console.log(`📍 Admin 요청: ${req.method} ${req.url}`);

    // 프론트엔드 경로가 없으면 안내 메시지
    if (!fs.existsSync(frontendPath)) {
      return res.status(404).json({
        error: 'Frontend not found',
        message: '관리자 페이지가 설정되지 않았습니다.',
        suggestion: 'API 엔드포인트를 사용해주세요.',
        api_docs: '/api'
      });
    }

    try {
      let requestPath = req.url;
      
      // 쿼리 파라미터 제거
      const questionMarkIndex = requestPath.indexOf('?');
      if (questionMarkIndex !== -1) {
        requestPath = requestPath.substring(0, questionMarkIndex);
      }

      // 루트 요청 처리
      if (!requestPath || requestPath === '/' || requestPath === '') {
        console.log('🏠 메인 페이지로 리다이렉트');
        return res.redirect('/admin/pages/index.html');
      }

      // 실제 파일 경로 구성
      const fullFilePath = path.join(frontendPath, requestPath);
      console.log(`📁 파일 요청: ${fullFilePath}`);

      // 보안: 상위 디렉터리 접근 방지
      if (!fullFilePath.startsWith(frontendPath)) {
        console.log('🚫 보안: 상위 디렉터리 접근 차단');
        return res.status(403).json({ error: 'Forbidden' });
      }

      // 파일 존재 확인
      if (fs.existsSync(fullFilePath)) {
        const stat = fs.statSync(fullFilePath);
        
        if (stat.isDirectory()) {
          // 디렉토리면 index.html 찾기
          const indexPath = path.join(fullFilePath, 'index.html');
          if (fs.existsSync(indexPath)) {
            return res.sendFile(indexPath);
          } else {
            return res.status(404).json({ error: 'Directory listing not allowed' });
          }
        }

        // MIME 타입 설정
        const ext = path.extname(fullFilePath).toLowerCase();
        const mimeTypes: { [key: string]: string } = {
          '.html': 'text/html; charset=utf-8',
          '.js': 'application/javascript; charset=utf-8',
          '.css': 'text/css; charset=utf-8',
          '.json': 'application/json',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.gif': 'image/gif',
          '.svg': 'image/svg+xml',
          '.ico': 'image/x-icon',
          '.woff': 'font/woff',
          '.woff2': 'font/woff2'
        };

        const contentType = mimeTypes[ext] || 'application/octet-stream';
        res.setHeader('Content-Type', contentType);

        // 캐시 설정 (개발 환경에서는 캐시 비활성화)
        if (process.env.NODE_ENV === 'development') {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        }

        console.log(`✅ 파일 전송: ${fullFilePath}`);
        return res.sendFile(fullFilePath);
      } else {
        console.log(`❌ 파일 없음: ${fullFilePath}`);
        return res.status(404).json({
          error: 'File Not Found',
          message: `요청한 파일을 찾을 수 없습니다: ${requestPath}`,
          suggestion: 'API 문서는 /api 에서 확인하세요.'
        });
      }
    } catch (error) {
      console.error('❌ 파일 서빙 에러:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: '파일 서빙 중 오류가 발생했습니다.'
      });
    }
  });

  // Swagger 설정
  // if (process.env.NODE_ENV !== 'production') {
  //   const swaggerConfig = new DocumentBuilder()
  //     .setTitle('Match Now API')
  //     .setDescription('Match Now API 문서')
  //     .setVersion('1.0')
  //     .addBearerAuth()
  //     .build();
  //   const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  //   SwaggerModule.setup('api', app, swaggerDocument);
  // }
  // 수정된 코드 (항상 활성화 또는 조건부 활성화)
  // 항상 활성화
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Match Now API')
    .setDescription('Match Now API 문서')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, swaggerDocument);

  
  // 루트 경로 정보
  app.use('/', (req, res, next) => {
    if (req.path === '/') {
      res.json({ 
        message: 'Match Now API Server', 
        status: 'running',
        timestamp: new Date().toISOString(),
        endpoints: {
          health: '/health',
          api: '/api',
          admin: '/admin/',
        },
        database: {
          mongodb: 'Connected',
          mysql: 'Connected'
        },
        version: '1.0.0'
      });
    } else {
      next();
    }
  });

  const port = process.env.PORT || 4011;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 API Server: ${await app.getUrl()}`);
  console.log(`📚 API Docs: ${await app.getUrl()}/api`);
  console.log(`💾 Health Check: ${await app.getUrl()}/health`);
  
  if (fs.existsSync(frontendPath)) {
    console.log(`🔧 Admin Panel: ${await app.getUrl()}/admin/`);
    console.log(`🔐 Login: ${await app.getUrl()}/admin/pages/login.html`);
  } else {
    console.log(`⚠️ Admin Panel: 프론트엔드 경로가 설정되지 않았습니다.`);
  }
}

void bootstrap();