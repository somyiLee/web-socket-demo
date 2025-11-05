# WebSocket 서버 배포 가이드

Vercel은 serverless 환경이기 때문에 WebSocket 서버를 호스팅할 수 없습니다.  
따라서 WebSocket 서버를 별도의 플랫폼에 배포해야 합니다.

## 옵션 1: Railway (추천) ⭐

Railway는 WebSocket을 지원하고 무료 티어가 있습니다.

### 1단계: Railway 계정 생성

1. [Railway.app](https://railway.app)에 접속
2. GitHub 계정으로 로그인

### 2단계: 새 프로젝트 생성

1. **New Project** 클릭
2. **Deploy from GitHub repo** 선택
3. 이 저장소 선택

### 3단계: 설정

1. **Settings** 탭으로 이동
2. **Start Command** 설정: `node websocket-server.js`
3. **Deploy** 클릭

### 4단계: WebSocket URL 확인

1. 배포가 완료되면 **Deployments** 탭에서 URL 확인
2. 예: `your-project.railway.app`
3. WebSocket URL: `wss://your-project.railway.app`

### 5단계: Vercel 환경 변수 설정

1. [Vercel 대시보드](https://vercel.com)에서 프로젝트로 이동
2. **Settings** > **Environment Variables**
3. 새 환경 변수 추가:
   - **Key**: `NEXT_PUBLIC_WS_URL`
   - **Value**: `wss://your-project.railway.app`
   - **Environments**: Production, Preview, Development 모두 체크
4. **Save** 클릭
5. 프로젝트 재배포: **Deployments** 탭 > 최신 배포 > **Redeploy**

---

## 옵션 2: Render

### 1단계: Render 계정 생성

1. [Render.com](https://render.com)에 접속
2. GitHub 계정으로 로그인

### 2단계: 새 Web Service 생성

1. **New +** > **Web Service** 클릭
2. 저장소 연결
3. 설정:
   - **Name**: `yjs-websocket-server`
   - **Environment**: `Node`
   - **Build Command**: (비워둠)
   - **Start Command**: `node websocket-server.js`
   - **Plan**: Free

### 3단계: 환경 변수 설정 (Render)

1. **Environment** 탭에서 환경 변수 추가:
   - **Key**: `PORT`
   - **Value**: `10000` (Render가 자동으로 할당)

### 4단계: WebSocket URL 확인

1. 배포 완료 후 URL 확인: `your-service.onrender.com`
2. WebSocket URL: `wss://your-service.onrender.com`

### 5단계: Vercel 환경 변수 설정

- 위의 Railway 5단계와 동일하게 진행

---

## 옵션 3: 로컬 ngrok (개발/테스트용)

빠른 테스트를 위해 ngrok을 사용할 수 있습니다.

### 1단계: ngrok 설치

```bash
# Windows (Chocolatey)
choco install ngrok

# macOS (Homebrew)
brew install ngrok
```

### 2단계: WebSocket 서버 실행

```bash
npm run ws-server
```

### 3단계: ngrok으로 터널 생성

```bash
ngrok http 1234
```

### 4단계: ngrok URL 사용

1. ngrok이 제공하는 URL 확인 (예: `https://xxxx-xx-xx-xx-xx.ngrok-free.app`)
2. Vercel 환경 변수에 설정:
   - **Key**: `NEXT_PUBLIC_WS_URL`
   - **Value**: `wss://xxxx-xx-xx-xx-xx.ngrok-free.app`

⚠️ **주의**: ngrok 무료 티어는 세션이 종료되면 URL이 변경됩니다.

---

## 테스트 방법

1. WebSocket 서버가 배포되고 Vercel 환경 변수가 설정된 후
2. Vercel 프로젝트를 재배포
3. 배포된 URL을 일반 모드와 시크릿 모드에서 각각 열기
4. 한 창에서 셀을 편집하고 다른 창에서 실시간 동기화 확인

---

## 문제 해결

### WebSocket 연결이 안 될 때

**1. 브라우저 콘솔 확인**

```javascript
// DevTools Console에서 확인
console.log('WS URL:', process.env.NEXT_PUBLIC_WS_URL);
```

**2. WebSocket 서버 로그 확인**

- Railway: **Deployments** > **View Logs**
- Render: **Logs** 탭 확인

**3. CORS 문제**

- WebSocket 서버는 CORS가 필요 없지만, HTTP upgrade가 차단될 수 있음
- 방화벽이나 프록시 설정 확인

**4. wss:// vs ws://**

- 로컬 개발: `ws://localhost:1234`
- 프로덕션 (HTTPS): `wss://your-domain.com`
- HTTP 사이트에서 wss:// 사용 시 mixed content 에러 발생

---

## 환경 변수 요약

### 로컬 개발 (.env.local)

```env
NEXT_PUBLIC_WS_URL=ws://localhost:1234
```

### Vercel 프로덕션

```
NEXT_PUBLIC_WS_URL=wss://your-websocket-server.railway.app
```

### Railway/Render WebSocket 서버

```
PORT=자동 할당 (설정 불필요)
```
