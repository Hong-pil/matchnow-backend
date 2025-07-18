// src/main.ts (안전한 패턴으로 수정)
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';
import * as path from 'path';
import * as fs from 'fs';
import helmet from 'helmet';
import * as hpp from 'hpp';

import { AppModule } from './app.module';

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

  // 프론트엔드 경로 설정
  const frontendPath = path.resolve(process.cwd(), '../matchnow-admin-web/src');
  console.log(`🗂️ Frontend 경로: ${frontendPath}`);

  // 경로 존재 확인
  if (fs.existsSync(frontendPath)) {
    console.log('✅ Frontend 경로 확인됨');
  } else {
    console.error('❌ Frontend 경로 없음:', frontendPath);
  }

  // 모든 요청을 가로채서 /admin으로 시작하는 것만 처리
  app.use((req, res, next) => {
    // API 요청은 바로 통과
    if (req.url.startsWith('/api') || req.url.startsWith('/health')) {
      return next();
    }

    // /admin으로 시작하지 않으면 통과
    if (!req.url.startsWith('/admin')) {
      return next();
    }

    console.log(`📍 Admin 요청: ${req.method} ${req.url}`);

    try {
      let requestPath = req.url;
      
      // 쿼리 파라미터 제거
      const questionMarkIndex = requestPath.indexOf('?');
      if (questionMarkIndex !== -1) {
        requestPath = requestPath.substring(0, questionMarkIndex);
      }

      // /admin 제거
      let filePath = requestPath.replace('/admin', '');
      
      // 루트 요청 처리
      if (!filePath || filePath === '/' || filePath === '') {
        console.log('🏠 메인 페이지로 리다이렉트');
        return res.redirect('/admin/pages/index.html');
      }

      // 실제 파일 경로 구성
      const fullFilePath = path.join(frontendPath, filePath);
      console.log(`📁 파일 요청: ${fullFilePath}`);

      // 보안: 상위 디렉터리 접근 방지
      if (!fullFilePath.startsWith(frontendPath)) {
        console.log('🚫 보안: 상위 디렉터리 접근 차단');
        return res.status(403).send('Forbidden');
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
            return res.status(404).send('Directory listing not allowed');
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
        return res.status(404).send(`
          <h1>404 - File Not Found</h1>
          <p>요청한 파일을 찾을 수 없습니다: ${filePath}</p>
          <p><a href="/admin/">관리자 메인으로 돌아가기</a></p>
        `);
      }
    } catch (error) {
      console.error('❌ 파일 서빙 에러:', error);
      return res.status(500).send(`
        <h1>500 - Internal Server Error</h1>
        <p>파일 서빙 중 오류가 발생했습니다.</p>
        <p><a href="/admin/">관리자 메인으로 돌아가기</a></p>
      `);
    }
  });

  // Swagger 설정 (API 요청이 통과한 후)
  if (process.env.NODE_ENV !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Match Now API')
      .setDescription('Match Now API 문서')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, swaggerDocument);
  }

  // 루트 경로 정보 (마지막에 위치)
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
        frontend: {
          main: '/admin/pages/index.html',
          login: '/admin/pages/login.html'
        }
      });
    } else {
      next();
    }
  });

  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  app.use(compression());

  if (process.env.NODE_ENV === 'production') {
    app.use(hpp());
    app.use(helmet({
      contentSecurityPolicy: false,
    }));
  }

  const port = process.env.PORT || 4011;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 API Server: ${await app.getUrl()}`);
  console.log(`📚 API Docs: ${await app.getUrl()}/api`);
  console.log(`🔧 Admin Panel: ${await app.getUrl()}/admin/`);
  console.log(`🔐 Login: ${await app.getUrl()}/admin/pages/login.html`);
}

void bootstrap();