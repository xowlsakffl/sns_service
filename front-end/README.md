# SNS Service Frontend

이 디렉터리는 `SNS Service`의 React 프론트엔드입니다.  
게시글 피드, 스토리, 게시글 상세, 댓글, 알림, 인증 화면을 포함하며, 현재 UI는 **Instagram 웹/모바일 피드 구조를 참고한 클론형 인터페이스**로 정리되어 있습니다.

브랜드를 그대로 복제하는 목적이 아니라, 실제 사용자들이 익숙하게 소비하는 **피드 중심 SNS UI 패턴**을 포트폴리오 화면으로 구현하는 데 초점을 맞췄습니다.

## 프론트 구현 포인트

- 스토리 바 + 피드 카드 + 하단 탭 구조
- PC에서도 모바일과 동일한 단일 컬럼 레이아웃
- 페이지네이션 대신 무한 스크롤 사용
- 게시글 상세 / 댓글 / 알림 화면까지 같은 톤으로 통일
- 로컬 시드 데이터 기반으로 바로 캡처 가능한 화면 구성

## 주요 화면

모든 이미지는 모바일 기준 캡처입니다.

### 로그인

![로그인](screenshots/mobile/mobile-login.png)

### 회원가입

![회원가입](screenshots/mobile/mobile-signup.png)

### 피드

![피드](screenshots/mobile/mobile-feed.png)

### 게시글 작성

![게시글 작성](screenshots/mobile/mobile-post.png)

### 내 게시물

![내 게시물](screenshots/mobile/mobile-mypost.png)

### 게시글 상세

![게시글 상세](screenshots/mobile/mobile-postdetail.png)

### 알림

![알림](screenshots/mobile/mobile-alarms.png)

## 실행 방법

```powershell
npm install
npm run start
```

개발 서버 주소:

- `http://127.0.0.1:3000`

## 데모 계정

- 일반 사용자: `demo / password123!`
- 관리자 사용자: `admin / admin1234!`

## 디렉터리 구조

```text
front-end/
├── src/
│   ├── layouts/             # 피드/인증/알림/게시글 화면
│   ├── hooks/               # 무한 스크롤 훅
│   ├── utils/               # 프로필 메타, 병합 유틸
│   ├── components/          # 공통 UI
│   └── styles/              # 전역 스타일
├── public/
└── screenshots/mobile/
```

## 참고

- 이 프론트엔드는 백엔드 API와 JWT 인증을 전제로 동작합니다.
- 로컬 `local` 프로필에서는 데모 데이터가 자동 시드되어 화면 확인이 쉽도록 구성했습니다.
