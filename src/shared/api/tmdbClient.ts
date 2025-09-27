import axios from "axios";

const TMDB_API_KEY = process.env.TMDB_API_KEY;

export const tmdbApi = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  params: {
    api_key: TMDB_API_KEY,
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
