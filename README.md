# 🎯 Match Now - 매칭 서비스 백엔드

NestJS, MongoDB, MySQL을 사용한 매칭 서비스 백엔드 API입니다.

## 🏗️ 기술 스택

- **Backend**: NestJS (Node.js)
- **Database**: MongoDB + MySQL
- **Authentication**: JWT + 소셜 로그인 (카카오, 구글, 애플)
- **API Documentation**: Swagger
- **Process Manager**: PM2
- **Package Manager**: pnpm

## 🚀 빠른 시작

### 📋 시스템 요구사항

- **Node.js** 18+ 
- **pnpm** (권장 패키지 매니저)
- **MongoDB** 4.4+ (Ubuntu Server에서 실행)
- **MySQL** 8.0+ (Ubuntu Server에서 실행)

### 🔧 환경별 설정

이 프로젝트는 두 가지 환경을 지원합니다:

| 환경 | MongoDB 연결 | MySQL 연결 | 설명 |
|------|-------------|-----------|------|
| **맥북 개발환경** | `175.126.95.157:27017` | `175.126.95.157:3306` | Ubuntu Server에 원격 접속 |
| **Ubuntu Server** | `localhost:27017` | `localhost:3306` | 로컬 데이터베이스 사용 |

## 🎯 서버 접속

```bash
$ ssh -p 22 matchnow@175.126.95.157
PW : 250618
```

## 🖥️ 맥북/서버에서 개발하기

### 📋 사전 준비사항
- Ubuntu Server(`175.126.95.157`)에 MongoDB, MySQL이 실행 중이어야 함
- 방화벽에서 포트 27017(MongoDB), 3306(MySQL) 개방 필요

### 🚀 맥북에서 개발할 때 (로컬 개발환경)

```bash
$ cd /var/www/html/matchnow-backend
$ git pull origin main
$ pnpm install
$ cp .env.development .env
$ pnpm run start:dev  # 빌드 생략, 핫 리로드 활용
$ curl http://localhost:4011/health
```

### 🚀 서버에서 운영 적용할 때 (프로덕션 배포)

```bash
$ cd /var/www/html/matchnow-backend 
$ git pull origin main 
$ sudo pnpm install 
$ cp .env.production .env 
$ sudo pnpm run build 
$ sudo pnpm run start:prod  # 배포 전 검증
$ curl http://localhost:4011/health
$ sudo pm2 stop matchnow-api 2>/dev/null || true  # 기존 PM2 프로세스 중지
$ sudo pm2 start dist/main.js --name "matchnow-api" --env production  # PM2로 재시작
$ sudo pm2 status  # 상태 확인
$ sudo pm2 logs matchnow-api --lines 10  # 로그 확인
```

### 🗄️ MongoDB 접속

```bash
# MongoDB 상태 확인 및 시작
$ sudo systemctl status mongod
$ sudo systemctl start mongod
# MongoDB 접속
$ mongo 'mongodb://matchnow_user:matchnow0618!!!@localhost:27017/matchnow_dev'
# Collection 조회
> db.getCollection('football-matches').find().limit(3).pretty()
# Collection 데이터 모두 삭제
> db.getCollection('football-matches').deleteMany({});

```

### 🗄️ MySQL 접속

```bash
# MySQL 상태 확인 및 시작
$ sudo systemctl status mysql
$ sudo systemctl start mysql
# MySQL 접속
$ mysql -h localhost -P 3306 -u matchnow_user -p
PW : matchNow0618!!!
# DataBase 사용
> use matchnow_dev;

```

### 🔍 연결 확인

```bash
# API 서버 상태 확인
curl http://localhost:4011/health

# 관리자 페이지 접속
open http://localhost:4011/admin/

# API 문서 확인
open http://localhost:4011/api
```

## 🔧 개발 도구

### 📝 사용 가능한 스크립트

```bash
# 환경별 실행
pnpm run dev:mac          # 맥북 개발환경
pnpm run dev:ubuntu       # Ubuntu Server 개발환경
pnpm run build:ubuntu     # Ubuntu Server 빌드
pnpm run start:ubuntu     # Ubuntu Server 프로덕션 실행

# 개발 도구
pnpm run lint             # ESLint 검사
pnpm run format           # Prettier 포맷팅
pnpm run test             # 테스트 실행
pnpm run test:watch       # 테스트 감시 모드

# PM2 관리
pnpm run pm2:start        # PM2 시작
pnpm run pm2:stop         # PM2 중지
pnpm run pm2:restart      # PM2 재시작
pnpm run pm2:logs         # PM2 로그

# 헬스체크
pnpm run health:check     # API 헬스체크
```

### 🔗 주요 엔드포인트

| 경로 | 설명 | 접속 URL |
|------|------|----------|
| `/` | 메인 API 정보 | http://localhost:4011/ |
| `/health` | 헬스체크 | http://localhost:4011/health |
| `/api` | Swagger API 문서 | http://localhost:4011/api |
| `/admin/` | 관리자 메인 페이지 | http://localhost:4011/admin/ |
| `/admin/login.html` | 관리자 로그인 | http://localhost:4011/admin/login.html |

## 🗃️ 5단계: 데이터베이스 설정

### 📊 MongoDB 설정

```bash
# 서버 접속
ssh -p 22 matchnow@175.126.95.157

# MongoDB 연결 (Ubuntu Server에서)
mongo 'mongodb://matchnow_user:matchnow0618!!!@localhost:27017/matchnow_dev'

# 컬렉션 조회
db.getCollection('football-matches').find().limit(3).pretty()
```

### 🗄️ MySQL 설정

```bash
# MySQL 연결 확인 (맥북에서)
mysql -h 175.126.95.157 -P 3306 -u matchnow_user -p

# Ubuntu Server에서
mysql -h localhost -P 3306 -u matchnow_user -p
```

### 📋 데이터베이스 스키마

**MongoDB 컬렉션 (비즈니스 로직용):**
- `countries` - 국가 정보
- `sports-categories` - 스포츠 카테고리
- `leagues` - 리그 정보
- `teams` - 팀 정보
- `players` - 선수 정보
- `games` - 경기 정보

**MySQL 테이블 (인증용):**
- `admin_users` - 관리자 계정
- `app_users` - 앱 사용자 계정

## 🔐 6단계: 인증 시스템

### 👨‍💼 관리자 인증

```bash
# 기본 슈퍼 관리자 계정 (최초 실행 시 자동 생성)
이메일: admin@matchnow.com
비밀번호: admin123!@#

# ⚠️ 보안을 위해 로그인 후 즉시 비밀번호 변경 필요
```

### 📱 앱 사용자 인증

- **소셜 로그인**: 카카오, 구글, 애플
- **JWT 토큰**: 7일 만료
- **자동 회원가입**: 첫 로그인 시 자동 계정 생성

## 🌐 7단계: BetsAPI 연동

### ⚽ 축구 경기 데이터

```bash
# 예정된 경기
curl http://localhost:4011/api/v1/football/matches/upcoming

# 진행 중인 경기
curl http://localhost:4011/api/v1/football/matches/inplay

# 종료된 경기
curl http://localhost:4011/api/v1/football/matches/ended

# 리그 목록
curl http://localhost:4011/api/v1/football/leagues
```

## 🔧 8단계: 문제 해결

### 🚫 일반적인 문제들

**포트 충돌:**
```bash
# 포트 사용 확인
lsof -i :4011    # NestJS 포트
lsof -i :27017   # MongoDB 포트  
lsof -i :3306    # MySQL 포트

# 프로세스 종료
kill -9 <PID>
```

**데이터베이스 연결 실패:**
```bash
# MongoDB 연결 테스트
mongo 'mongodb://admin:matchnow0618!!!@175.126.95.157:27017/matchnow_dev?authSource=admin'

# MySQL 연결 테스트
mysql -h 175.126.95.157 -P 3306 -u matchnow_user -p matchnow_dev
```

**방화벽 문제:**
```bash
# Ubuntu Server에서 포트 개방 확인
sudo ufw status
sudo netstat -tlnp | grep :27017
sudo netstat -tlnp | grep :3306
```

### 🔄 완전 초기화

```bash
# PM2 프로세스 정리
pm2 delete all

# Node modules 재설치
rm -rf node_modules package-lock.json
pnpm install

# 빌드 폴더 정리
rm -rf dist
pnpm run build
```

## 📚 9단계: API 문서

### 🔗 Swagger UI
개발 서버 실행 후 다음 URL에서 API 문서를 확인할 수 있습니다:
- **로컬**: http://localhost:4011/api
- **서버**: http://175.126.95.157/api

### 📋 주요 API 그룹

- **Countries** - 국가 관리
- **Sports Categories** - 스포츠 카테고리 관리
- **Leagues** - 리그 관리
- **Teams** - 팀 관리
- **Players** - 선수 관리
- **Admin Authentication** - 관리자 인증
- **App Authentication** - 앱 사용자 인증
- **BetsAPI Football** - 축구 경기 데이터

## 🛡️ 10단계: 보안 설정

### 🔐 환경변수 보안

```bash
# JWT 시크릿 변경 (중요!)
JWT_SECRET=your_super_secret_jwt_key_change_this_later_2024

# 데이터베이스 비밀번호 변경 권장
MONGO_ROOT_PASSWORD=your_strong_password
MYSQL_PASSWORD=your_strong_password
```

### 🔒 방화벽 설정

```bash
# Ubuntu Server 방화벽 설정
sudo ufw allow 4011      # API 서버
sudo ufw allow 27017     # MongoDB (외부 접근용)
sudo ufw allow 3306      # MySQL (외부 접근용)
sudo ufw allow 22        # SSH
sudo ufw enable
```

## 🚀 11단계: 배포 가이드

### 🔄 지속적 배포

```bash
# 1. 코드 업데이트
git pull origin main

# 2. 의존성 업데이트
pnpm install

# 3. 빌드 및 배포
pnpm run deploy:prod

# 4. 상태 확인
pm2 status
curl http://localhost:4011/health
```

### 📊 모니터링

```bash
# PM2 모니터링
pm2 monit

# 로그 확인
pm2 logs match-now-api --lines 100

# 시스템 리소스 확인
htop
df -h
```

## 🤝 12단계: 개발 팀 협업

### 📥 새 팀원 온보딩

```bash
# 1. 저장소 클론 및 설정
git clone git@github.com:Hong-pil/matchnow-server.git
cd matchnow-server
pnpm install

# 2. 환경별 실행
# 맥북
pnpm run dev:mac

# Ubuntu Server
pnpm run dev:ubuntu
```

### 🔄 개발 워크플로우

1. **브랜치 전략**: `main` → `develop` → `feature/기능명`
2. **코드 리뷰**: PR 필수, 최소 1명 승인
3. **환경변수**: `.env` 파일은 커밋하지 않음
4. **테스트**: 배포 전 필수 테스트 실행

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 🆘 지원 및 문의

### 🐛 버그 리포트
문제가 있으시면 GitHub Issues에 등록해주세요.

### 📚 추가 자료
- **API 문서**: http://localhost:4011/api
- **관리자 페이지**: http://localhost:4011/admin/
- **NestJS 공식 문서**: https://nestjs.com
- **MongoDB 공식 문서**: https://docs.mongodb.com
- **MySQL 공식 문서**: https://dev.mysql.com/doc/

---

**🎯 Happy Coding! 즐거운 개발 되세요!**

> 💡 **팁**: 이 README는 살아있는 문서입니다. 프로젝트가 발전함에 따라 지속적으로 업데이트됩니다.