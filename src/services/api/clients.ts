import axios, { AxiosInstance } from "axios";
import { env, hasValue } from "../../config/env";

export const PLACEHOLDER_IMAGE =
  "https://via.placeholder.com/128x192?text=No+Cover";

export const tmdbApi = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  params: {
    api_key: env.tmdbApiKey,
    language: "ko-KR",
  },
  timeout: 10000,
});

tmdbApi.interceptors.request.use(
  (config) => {
    console.log(`API 요청: ${config.url}, 파라미터:`, config.params);
    return config;
  },
  (error) => {
    console.error("API 요청 오류:", error);
    return Promise.reject(error);
  }
);

tmdbApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(`API 응답 오류: ${error.message}`, error.config);
    if (error.response) {
      console.error("응답 데이터:", error.response.data);
      console.error("응답 상태:", error.response.status);
    }
    return Promise.reject(error);
  }
);

export const hasNaverBookCredentials =
  hasValue(env.naverClientId) && hasValue(env.naverClientSecret);

export const naverBookApi: AxiosInstance | null = hasNaverBookCredentials
  ? axios.create({
      baseURL: "https://openapi.naver.com/v1/search",
      timeout: 10000,
      headers: {
        "X-Naver-Client-Id": env.naverClientId,
        "X-Naver-Client-Secret": env.naverClientSecret,
      },
    })
  : null;

if (!hasNaverBookCredentials) {
  console.warn(
    "[api] 네이버 도서 API 자격 증명이 없어 구글 도서 API로 대체됩니다."
  );
}

export const googleBooksApi = axios.create({
  baseURL: "https://www.googleapis.com/books/v1",
  timeout: 10000,
});
