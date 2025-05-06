import axios from "axios";
import { ApiResponse, Movie, Book } from "../types";

const TMDB_API_KEY = process.env.TMDB_API_KEY;

// NAVER API 정보 (https://developers.naver.com/에서 발급)
const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

// TMDB API 기본 설정
const tmdbApi = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  params: {
    api_key: TMDB_API_KEY,
    language: "ko-KR",
  },
});

// 네이버 책 API 기본 설정
const naverBookApi = axios.create({
  baseURL: "https://openapi.naver.com/v1/search",
  headers: {
    "X-Naver-Client-Id": NAVER_CLIENT_ID,
    "X-Naver-Client-Secret": NAVER_CLIENT_SECRET,
  },
});

// 영화 API 서비스
export const movieService = {
  // 인기 영화 가져오기
  getPopular: async (page = 1): Promise<ApiResponse<Movie>> => {
    const response = await tmdbApi.get("/movie/popular", {
      params: { page },
    });
    return response.data;
  },

  // 영화 검색하기
  searchMovies: async (
    query: string,
    page = 1
  ): Promise<ApiResponse<Movie>> => {
    const response = await tmdbApi.get("/search/movie", {
      params: { query, page },
    });
    return response.data;
  },

  // 영화 상세 정보 가져오기
  getMovieDetails: async (movieId: number): Promise<Movie> => {
    const response = await tmdbApi.get(`/movie/${movieId}`);
    return response.data;
  },

  // 장르별 영화 가져오기
  getMoviesByGenre: async (
    genreId: number,
    page = 1
  ): Promise<ApiResponse<Movie>> => {
    const response = await tmdbApi.get("/discover/movie", {
      params: { with_genres: genreId, page },
    });
    return response.data;
  },
};

// 책 API 서비스
export const bookService = {
  // 책 검색하기
  searchBooks: async (
    query: string,
    start = 1,
    display = 10
  ): Promise<ApiResponse<Book>> => {
    const response = await naverBookApi.get("/book.json", {
      params: { query, start, display },
    });

    // 네이버 API 응답 형식을 우리 앱의 Book 형식으로 변환
    const books: Book[] = response.data.items.map((item: any) => ({
      isbn: item.isbn,
      title: item.title,
      author: item.author,
      description: item.description,
      cover_image: item.image,
      published_date: item.pubdate,
      publisher: item.publisher,
      price: parseInt(item.price, 10),
    }));

    return {
      results: books,
      total_results: response.data.total,
      page: Math.ceil(start / display),
      total_pages: Math.ceil(response.data.total / display),
    };
  },

  // 베스트셀러 가져오기 (네이버 API에는 없으므로 추가 구현 필요)
  getBestSellers: async (): Promise<ApiResponse<Book>> => {
    // 실제 구현에서는 다른 API나 하드코딩된 데이터를 사용할 수 있습니다
    const response = await naverBookApi.get("/book.json", {
      params: { query: "베스트셀러", display: 10 },
    });

    const books: Book[] = response.data.items.map((item: any) => ({
      isbn: item.isbn,
      title: item.title,
      author: item.author,
      description: item.description,
      cover_image: item.image,
      published_date: item.pubdate,
      publisher: item.publisher,
      price: parseInt(item.price, 10),
    }));

    return {
      results: books,
      total_results: response.data.total,
    };
  },
};
