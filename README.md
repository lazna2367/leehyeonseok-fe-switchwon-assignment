# Switchwon FE Assignment – 환전 애플리케이션

간단한 환전 웹앱입니다. 로그인 → 환율 확인 → 환전 → 내역 조회 흐름을 최소한의 조작으로 수행할 수 있도록 만들었습니다. 실행과 읽기가 쉬운 코드, 명확한 에러 메시지, 안정적인 라우팅을 목표로 했습니다.

## 빠른 시작

1. 의존성 설치

```bash
pnpm i # or npm i / yarn
```

2. 환경변수(.env)

```bash
VITE_API_BASE_URL=https://exchange-example.switchflow.biz
```

설정이 없으면 기본값(위 URL)을 사용하지만, 개발 중엔 명시적으로 넣는 걸 권장합니다.

3. 실행

```bash
pnpm dev
```

## 기술 스택

- React 19, TypeScript, Vite
- Tailwind v4, shadcn(ui)
- React Router, TanStack Query
- Axios (공통 인스턴스 + 인터셉터)

## 주요 기능

- 이메일 로그인(토큰 저장) / 보호 라우트
- 환율 카드(USD, JPY) + 1분 주기 자동 갱신
- 환전하기(살래요/팔래요, 잔액/한도 클램프)
- 환전 내역(서버 데이터, 10개 페이지네이션, 고정 높이)
- 토큰 만료 시 재로그인 안내(Dialog)
- 표준화된 에러 메시지(코드 기반 매핑)

## 디렉터리 구조(요약)

```
src/
  api/               # API 래퍼 (axios 인스턴스 사용)
  components/        # UI 컴포넌트(shadcn) + TopNav
  layouts/           # AppLayout(공통 헤더/페이지 타이틀)
  lib/               # api 인스턴스, 에러 매핑
  pages/             # Login / Exchange / History
  types/             # ApiResponse, Order, Wallet, ExchangeRate 타입
```

## 설계/구현 메모

### 왜 /orders/quote 대신 /exchange-rates/latest 를 썼는가

초기 화면에서 사용자가 금액을 입력하기 전까지는 “견적(quote)”이 꼭 필요하지 않다고 생각했습니다. 입력값마다 `/orders/quote`를 호출하면 서버에 불필요한 부하가 생기고, 입력이 변할 때마다 quote를 다시 불러오면 UX가 산만해집니다.

그래서 기본 표시는 `/exchange-rates/latest`의 최신 환율로 처리하고, 필요 원화 계산은 클라이언트에서 계산했습니다. 이 접근의 장점은 다음과 같습니다.

- 초기 로딩이 가볍고, 카드/레이아웃이 빠르게 그려짐
- 입력 전에는 최신 환율만 알면 되므로 네트워크 호출 수가 줄어듦
- 환율이 1분 단위로 자동 갱신되어 화면이 자연스럽게 최신 상태 유지

실제로 견적 금액이 서버 계산(수수료, 정책 등)과 달라야 하는 상황이라면 입력 변경에 맞춰 `/orders/quote`를 호출하도록 바꾸면 됩니다. 현재 과제 요구 범위에선 최신 환율로 계산해도 충분했고, UX 상 이점이 컸습니다.

### 인증/보호 라우트

- 토큰은 `localStorage`에 저장합니다.
- 인터셉터에서 401 응답이 오면 토큰 삭제 + 로그인으로 이동하고, 세션 만료 안내 문구를 띄웁니다.

### 공통 에러 처리

`src/lib/errors.ts`에 Swagger `code`를 사람이 읽을 수 있는 문장으로 변환하는 매퍼를 작성했습니다. 인터셉터에서 이를 사용해 `Error(message)`로 넘기고, 화면에선 `error.message`만 쓰면 됩니다.

### 타입

`ApiResponse<T>, Order, Wallet, ExchangeRate` 등의 공용 타입을 `src/types/api.ts`에 두었습니다. API 래퍼(`src/api/*.ts`)는 이 타입을 반환하도록 지정해 런타임과 에디터에서 일관성을 보장합니다.

### UI 디테일

- 로그인 에러 문구 영역은 고정 높이로 예약해 버튼 위치가 흔들리지 않습니다.
- History 테이블은 colgroup + table-fixed로 폭을 고정하고, 한 페이지 10행 기준 높이를 맞춰 페이지 전환 시 점프가 없습니다.
- 환율 변화율은 소수점 1자리까지 표기하며 0.0%는 숨깁니다.

## 스크립트

```bash
pnpm dev         # 개발 서버
pnpm build       # 프로덕션 빌드
pnpm preview     # 빌드 미리보기
```

## 개선 아이디어(다음 단계)

- 입력 금액 변경 시 `/orders/quote`를 사용한 실시간 견적 표시(정책/수수료 반영)
- 토스트 시스템 도입(shadcn toast) + 인터셉터 연동
- 통화별 소수 제한(USD 2자리 등) 유효성 강화
- 가벼운 테스트: 환율 보정(JPY 100 → 1엔), 금액 제한 로직

---

API 문서: `https://exchange-example.switchflow.biz/swagger-ui/index.html`  
과제 안내: `https://github.com/Switchwon-Dev/frontend-developer-challenge`
