# 🚀 배포 체크리스트

## WebSocket 서버를 Railway에 배포하기

### ✅ 사전 준비

- [ ] Railway 계정 생성 ([railway.app](https://railway.app))
- [ ] GitHub 저장소에 코드 푸시

### ✅ Railway 배포

1. - [ ] Railway에서 "New Project" 클릭
2. - [ ] "Deploy from GitHub repo" 선택
3. - [ ] 이 저장소 선택
4. - [ ] Settings > Start Command: `node websocket-server.js`
5. - [ ] Deploy 완료 대기
6. - [ ] 배포 URL 복사 (예: `your-project.railway.app`)

### ✅ Vercel 환경 변수 설정

1. - [ ] [Vercel 대시보드](https://vercel.com) 접속
2. - [ ] 프로젝트 선택
3. - [ ] Settings > Environment Variables 이동
4. - [ ] 새 환경 변수 추가:
   - Key: `NEXT_PUBLIC_WS_URL`
   - Value: `wss://your-project.railway.app`
   - Environments: Production, Preview, Development 모두 체크
5. - [ ] Save 클릭
6. - [ ] Deployments 탭에서 "Redeploy" 클릭

### ✅ 테스트

1. - [ ] Vercel 배포 완료 대기
2. - [ ] 일반 Chrome 창에서 배포된 URL 접속
3. - [ ] 시크릿 모드 Chrome 창에서 동일한 URL 접속
4. - [ ] 한쪽 창에서 셀 편집
5. - [ ] 다른 쪽 창에서 실시간 동기화 확인 ✨
6. - [ ] 사용자 정보(이름, 색상)가 표시되는지 확인
7. - [ ] 편집 중인 셀에 테두리가 표시되는지 확인

### 🐛 문제 해결

#### "연결 중..." 상태에서 멈춤

- [ ] Railway 배포 로그 확인 (Deployments > View Logs)
- [ ] Vercel 환경 변수가 올바르게 설정되었는지 확인
- [ ] WebSocket URL이 `wss://`로 시작하는지 확인 (https 사이트는 wss 필요)

#### Railway 서버가 시작되지 않음

- [ ] package.json의 dependencies에 필요한 패키지 확인
- [ ] websocket-server.js 파일이 저장소에 푸시되었는지 확인
- [ ] Railway Start Command가 올바른지 확인

#### 일부 브라우저에서만 동작

- [ ] 브라우저 콘솔에서 에러 메시지 확인
- [ ] 캐시 및 쿠키 삭제 후 재시도
- [ ] 시크릿 모드로 테스트

---

## 🎉 완료!

모든 체크가 완료되면 실시간 협업 스프레드시트가 작동합니다!

**다음 단계:**

- 더 많은 사용자와 테스트
- 성능 모니터링
- 추가 기능 개발

---

## 📊 예상 비용

### Railway (무료 티어)

- ✅ $5 무료 크레딧/월
- ✅ WebSocket 서버 충분히 실행 가능
- ✅ 신용카드 등록 불필요 (무료 티어)

### Vercel (무료 티어)

- ✅ 100GB 대역폭/월
- ✅ 무제한 배포
- ✅ 신용카드 등록 불필요

**총 비용: $0** 🎉
