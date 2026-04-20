# SNS Service

SNS Service는 게시글 기반 소셜 피드와 알림 기능을 제공하는 Spring Boot API 서버입니다. 회원가입/로그인, JWT 인증, 게시글/댓글/좋아요, SSE 알림, 신고/블라인드 처리 흐름을 담당합니다.

포트폴리오 관점에서 핵심은 단순 CRUD를 넘어, 인증/인가 기반 쓰기 API 보호, 실시간 알림(SSE), 신고 누적 자동 블라인드, 관리자 신고 처리(승인/반려), 필터 검색 및 대시보드 집계까지 운영형 기능을 백엔드 중심으로 구현한 점입니다.

SNS Service는 커뮤니티형 서비스에서 필요한 기본 피드 기능을 빠르게 제공하도록 설계되었습니다. 사용자 인증을 통해 게시글 활동을 보호하고, 좋아요/댓글 이벤트를 알림으로 전달하며, 신고 시스템을 통해 콘텐츠 품질과 안전성을 관리할 수 있도록 구성했습니다.

이 저장소는 그 서비스 중 API/인증/도메인 계층과 프론트 정적 빌드 연동을 담당합니다. 프론트엔드 또는 외부 클라이언트는 REST API와 SSE 구독을 사용해 로그인 상태, 피드 데이터, 알림 스트림, 신고 처리 상태를 동기화합니다.

## 주요 기능

- 회원가입 및 로그인 API (JWT)
- 게시글 생성/수정/삭제/목록/내 글 조회
- 게시글 좋아요 및 좋아요 수 조회
- 게시글 댓글 작성/조회
- SSE 기반 알림 구독 및 전송
- 게시글 신고 등록
- 신고 누적 임계치 기반 자동 블라인드
- 관리자 신고 처리 (블라인드 승인/반려)
- 관리자 신고 필터 검색 (`status`, `reasonType`, `postId`, `reporterUsername`)
- 관리자 신고 대시보드 집계 API
- 요청 유효성 검증 및 전역 예외 응답 처리

## 기술 스택

![Java](https://img.shields.io/badge/Java-17-007396?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-2.7-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring%20Security-JWT-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white)
![MariaDB](https://img.shields.io/badge/MariaDB-003545?style=for-the-badge&logo=mariadb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![React](https://img.shields.io/badge/React-17-61DAFB?style=for-the-badge&logo=react&logoColor=black)

- Java 17
- Spring Boot 2.7.x
- Spring Security + JWT
- Spring Data JPA
- MariaDB
- Redis
- SSE (Server-Sent Events)
- React (CRA)
- Gradle

## 프로젝트 구조

```text
sns_service/
├── src/main/java/dev/be/snsservice/
│   ├── configuration/           # Security, Redis, JWT Filter
│   ├── controller/              # User/Post API
│   │   ├── request/             # 요청 DTO
│   │   └── response/            # 응답 DTO
│   ├── exception/               # 예외/에러코드/전역 핸들러
│   ├── model/                   # 도메인 모델, enum
│   │   └── entity/              # JPA Entity
│   ├── repository/              # JPA/캐시/SSE Repository
│   ├── service/                 # 비즈니스 로직
│   └── util/                    # JWT/유틸
├── src/main/resources/
│   └── application.yml
├── src/test/                    # 테스트 코드
├── front-end/                   # React 프론트엔드
├── database/                    # DB 도커 설정
├── redis/                       # Redis 도커 설정
└── docker-compose-local.yml
```

## 실행 준비

```bash
./gradlew build
./gradlew bootRun
```

PowerShell:

```powershell
.\gradlew.bat build
.\gradlew.bat bootRun
```

프론트 단독 실행:

```bash
cd front-end
npm install
npm run start
```

도커(로컬 DB/Redis) 실행:

```bash
docker compose -f docker-compose-local.yml up -d
```

## 주요 환경변수

| 변수 | 설명 |
| --- | --- |
| `SPRING_DATASOURCE_USERNAME` | MariaDB 사용자명 |
| `SPRING_DATASOURCE_PASSWORD` | MariaDB 비밀번호 |
| `JWT_SECRET_KEY` | JWT 서명 키 (`application.yml` 기본값 오버라이드) |
| `SPRING_PROFILES_ACTIVE` | 실행 프로필 (`local`, `prod`) |

## 보완한 부분

- 프론트 정적 산출물 경로를 `front-end/static`에서 `front-end/build`로 수정
- DTO 검증(`@Valid`, `@NotBlank`, `@Size`) 및 요청 역직렬화 안정성 보강
- 게시글 수정/삭제 권한 체크를 엔티티 참조 비교에서 ID 비교로 수정
- SSE emitter 저장소를 `ConcurrentHashMap`으로 변경해 동시성 안정성 보강
- SSE 타임아웃 상수값 실제 적용
- JWT SSE 구독 토큰 파싱 로직 안전화 (`request.getParameter("token")`)
- 전역 예외 처리에서 런타임 핸들러 시그니처 오류 수정
- 검증 실패 응답 코드/에러코드 정리 (`INVALID_REQUEST`)
- 회원가입 시 민감정보 로그 출력 제거
- JWT 비밀키를 환경변수 기반으로 오버라이드 가능하게 개선
- 신고/블라인드 도메인 추가
  - 신고 사유 분류 enum (`SPAM`, `ABUSE`, `SEXUAL`, `HATE`, `ETC`)
  - 관리자 신고 필터 검색
  - 관리자 신고 대시보드 집계 API

## 관련 저장소

- 원격 저장소: `https://github.com/xowlsakffl/sns_service.git`
- 본 저장소는 백엔드 API와 프론트 정적 리소스 빌드 연동을 포함한 통합 레포입니다.
