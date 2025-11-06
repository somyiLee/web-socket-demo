# 🔄 실시간 협업 스프레드시트

Next.js, WebSocket, Yjs를 사용한 실시간 협업 스프레드시트 데모입니다.

## 🚀 기술 스택

### Frontend

- **Next.js 16** - React 프레임워크
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 스타일링

### 실시간 협업

- **Yjs** - CRDT 기반 실시간 협업 라이브러리 (충돌 없는 데이터 동기화)
- **y-websocket** - 클라이언트 WebSocket Provider (브라우저 ↔ 서버 연결)

### WebSocket 서버

- **ws** - Node.js WebSocket 서버 라이브러리 (네트워크 통신)
- **y-protocols** - Yjs 동기화 프로토콜 (Yjs 메시지 해석 및 변환)

### 개발 도구

- **concurrently** - 여러 명령어 동시 실행 (Next.js + WebSocket 서버)

## 📋 기능

- ✅ 실시간 다중 사용자 동시 편집
- ✅ **사용자 Awareness** - 누가 어떤 셀을 편집하고 있는지 실시간 확인

## 🛠️ 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

Next.js와 WebSocket 서버를 동시에 실행:

```bash
npm run dev:all
```

또는 각각 별도 터미널에서 실행:

```bash
# 터미널 1 - Next.js
npm run dev

# 터미널 2 - WebSocket 서버
npm run ws-server
```

### 3. 브라우저에서 열기

여러 브라우저 탭이나 창에서 동시에 접속하세요:

```
http://localhost:3000
```

## 🌐 배포 (Vercel + Railway)

Vercel은 serverless 환경이라 WebSocket 서버를 호스팅할 수 없습니다.  
따라서 WebSocket 서버를 별도로 배포되어 있습니다.
main branch에 push 시 자동으로 두 서버가 build됩니다.

### 🔗 배포된 서비스

- **🌐 웹사이트 (Vercel)**: [https://web-socket-demo-seven.vercel.app/](https://web-socket-demo-seven.vercel.app/)
- **🔌 WebSocket 서버 (Railway)**: [https://web-socket-demo-production.up.railway.app/](https://web-socket-demo-production.up.railway.app/)

여러 탭이나 브라우저를 열어서 실시간 협업을 테스트해보세요! 🚀

## 🔍 작동 원리

### 1. Yjs (CRDT 엔진)

- **Conflict-free Replicated Data Type**을 사용하여 충돌 없이 데이터를 동기화
- 여러 사용자가 동시에 편집해도 자동으로 병합
- 각 클라이언트가 로컬에서 편집하고, 변경사항이 자동으로 동기화

### 2. WebSocket 통신

- **클라이언트**: `y-websocket` Provider가 브라우저와 서버 연결
- **서버**: `ws` 라이브러리로 WebSocket 서버 구축
- **프로토콜**: `y-protocols`로 Yjs 메시지 해석 및 변환

### 3. Awareness (실시간 상태 공유)

- 다른 사용자의 편집 중인 셀을 실시간으로 표시
- 각 사용자에게 고유한 이름과 색상 할당
- 연결 끊으면 자동으로 사라지는 일시적 상태

### 📊 아키텍처 다이어그램

```
┌──────────────────┐         WebSocket (ws)         ┌──────────────────┐
│    Client A      │◄──────────────────────────────►│    Client B      │
│                  │                                │                  │
│  ┌────────────┐  │    ┌─────────────────────┐     │  ┌────────────┐  │
│  │ React UI   │  │    │  WebSocket Server   │     │  │ React UI   │  │
│  └─────┬──────┘  │    │                     │     │  └─────┬──────┘  │
│        │         │    │  ┌───────────────┐  │     │        │         │
│  ┌─────▼──────┐  │    │  │ ws            │  │     │  ┌─────▼──────┐  │
│  │ Yjs Doc    │◄─┼────┼──┤ y-protocols   │◄─┼─────┼─►│ Yjs Doc    │  │
│  │ (Map)      │  │    │  │ Yjs Doc       │  │     │  │ (Map)      │  │
│  └────────────┘  │    │  └───────────────┘  │     │  └────────────┘  │
│                  │    │                     │     │                  │
│  Provider:       │    │  Room: 'demo-room'  │     │  Provider:       │
│  y-websocket     │    │                     │     │  y-websocket     │
└──────────────────┘    └─────────────────────┘     └──────────────────┘

    셀 데이터 동기화              서버가 중계                셀 데이터 동기화
    + Awareness 공유                                     + Awareness 수신
```

## 📂 프로젝트 구조

```
websoket-demo/
├── app/
│   ├── components/
│   │   └── SpreadSheet/
│   │       ├── index.tsx                    # 메인 컴포넌트 (훅 조합)
│   │       ├── components/                  # UI 컴포넌트
│   │       │   ├── SpreadSheetGrid.tsx         # 그리드 렌더링
│   │       │   ├── Cells.tsx                   # 셀 컴포넌트
│   │       │   ├── Header.tsx                  # 헤더
│   │       │   └── ConnectionStatus.tsx        # 연결 상태 표시
│   │       ├── hooks/                       # 커스텀 훅 (비즈니스 로직)
│   │       │   ├── useYjsDocument.ts           # Yjs Doc 초기화
│   │       │   ├── useWebSocketConnection.ts   # 연결 상태
│   │       │   ├── useCollaborativeData.ts     # 데이터 동기화
│   │       │   ├── useAwareness.ts             # 사용자 Awareness
│   │       │   └── useCellEvents.ts            # 셀 이벤트
│   │       ├── types/
│   │       │   └── index.ts                # TypeScript 타입
│   │       ├── constants/
│   │       │   └── index.ts                # 상수 정의
│   │       └── utils/
│   │           └── index.ts                # 유틸리티 함수
│   ├── page.tsx                            # 메인 페이지
│   └── layout.tsx                          # 레이아웃
│
├── websocket-server.js                     # WebSocket 서버 (ws + y-protocols)
├── package.json
├── railway.json                            # Railway 배포 설정
├── nixpacks.toml                           # Nixpacks 빌드 설정
└── README.md
```

### 🏗️ 아키텍처 설계 원칙

**관심사의 분리 (Separation of Concerns)**

- **UI 컴포넌트**: 렌더링만 담당 (순수 프레젠테이션)
- **커스텀 훅**: 비즈니스 로직 분리 (재사용 가능)
- **타입/상수**: 중앙 집중식 관리

**각 훅의 책임**

| 훅                       | 책임                       |
| ------------------------ | -------------------------- |
| `useYjsDocument`         | Yjs Doc 및 Provider 초기화 |
| `useWebSocketConnection` | 연결 상태 추적             |
| `useCollaborativeData`   | 셀 데이터 동기화           |
| `useAwareness`           | 사용자 편집 상태 관리      |
| `useCellEvents`          | 셀 선택 및 포커스 이벤트   |

## 🎨 주요 기능 상세

### 실시간 사용자 Awareness

- **편집 중 표시**: 다른 사용자가 편집 중인 셀은 해당 사용자의 색상으로 하이라이트됩니다
- **사용자 이름 표시**: 편집 중인 셀 위에 사용자 이름이 표시됩니다
- **색상 구분**: 각 사용자는 10가지 색상 중 하나를 랜덤으로 할당받습니다
- **실시간 업데이트**: 사용자가 셀을 포커스하거나 해제하면 즉시 다른 사용자에게 전달됩니다

## 📚 참고 자료

- [Yjs 공식 문서](https://docs.yjs.dev/)
- [Yjs 아키텍처 개선 과정](https://growth-coder.tistory.com/362)
- [WebSocket 개념 및 활용](https://www.jaenung.net/tree/open/34445)
