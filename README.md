# 📚🎬 북무비 - 나만의 영화/책 리뷰 앱

React Native와 TypeScript로 개발된 영화/책 리뷰 및 추천 앱입니다.

## 주요 기능

- **영화/책 검색**: TMDB API와 네이버 책 API를 활용한 검색 기능
- **리뷰 작성**: 별점과 함께 영화/책에 대한 리뷰 작성
- **컬렉션 관리**: 나만의 컬렉션으로 영화/책 분류
- **추천 시스템**: 비슷한 장르, 평점을 기반으로 한 추천

## 기술 스택

- React Native
- TypeScript
- Expo
- React Navigation
- AsyncStorage
- Axios

## 개발 환경 설정

1. 저장소 클론

```bash
git clone https://github.com/yourusername/book-movie-review-app.git
cd book-movie-review-app
```

2. 의존성 설치

```bash
pnpm install
```

3. API 키 설정
   `src/services/api.ts` 파일에서 다음 API 키를 설정해야 합니다:

- TMDB API 키: https://www.themoviedb.org 에서 가입 후 발급
- 네이버 개발자 API 키: https://developers.naver.com 에서 가입 후 발급

4. 앱 실행

```bash
pnpm run android   # 안드로이드 실행
pnpm run ios       # iOS 실행 (MacOS 필요)
pnpm run web       # 웹 버전 실행
```

## 프로젝트 구조

```
book-movie-review-app/
├── src/
│   ├── assets/        # 이미지, 폰트 등 정적 자산
│   ├── components/    # 공통 UI 컴포넌트
│   ├── hooks/         # 커스텀 훅
│   ├── navigation/    # 내비게이션 설정
│   ├── screens/       # 화면 컴포넌트
│   ├── services/      # API 통신 및 로컬 스토리지 서비스
│   ├── types/         # TypeScript 타입 정의
│   └── utils/         # 유틸리티 함수
├── App.tsx            # 앱 진입점
└── package.json
```

## 향후 개발 계획

- [ ] 사용자 인증 구현
- [ ] 더 정교한 추천 알고리즘
- [ ] 커뮤니티 기능 추가
- [ ] 실시간 데이터 동기화

## 라이센스

MIT License
