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
  timeout: 10000,
});

// 요청 인터셉터
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

// 응답 인터셉터
tmdbApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error(`API 응답 오류: ${error.message}`, error.config);
    if (error.response) {
      console.error("응답 데이터:", error.response.data);
      console.error("응답 상태:", error.response.status);
    }
    return Promise.reject(error);
  }
);

// 구글 북스 API 기본 설정
const googleBooksApi = axios.create({
  baseURL: "https://www.googleapis.com/books/v1",
  timeout: 10000,
});

// 영화 API 서비스
export const movieService = {
  // 인기 영화 가져오기
  getPopular: async (page = 1): Promise<ApiResponse<Movie>> => {
    try {
      console.log(`인기 영화 요청: 페이지 ${page}`);
      const response = await tmdbApi.get("/movie/popular", {
        params: { page },
      });

      if (response.data.page !== page) {
        console.warn(`페이지 불일치: 요청=${page}, 응답=${response.data.page}`);
      }

      return response.data;
    } catch (error) {
      console.error(`인기 영화 가져오기 오류(페이지 ${page}):`, error);
      throw error;
    }
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

// 구글 북스 API로 받은 데이터를 Book 타입으로 변환하는 함수
const convertGoogleBookToBook = (item: any): Book => {
  const volumeInfo = item.volumeInfo || {};
  const imageLinks = volumeInfo.imageLinks || {};

  return {
    isbn: volumeInfo.industryIdentifiers?.[0]?.identifier || item.id,
    title: volumeInfo.title || "제목 없음",
    author: volumeInfo.authors?.join(", ") || "작자 미상",
    description: volumeInfo.description || "설명 없음",
    cover_image:
      imageLinks.thumbnail ||
      "https://via.placeholder.com/128x192?text=No+Cover",
    published_date: volumeInfo.publishedDate || "",
    publisher: volumeInfo.publisher || "출판사 미상",
    price: 0, // 구글 북스 API는 가격 정보를 제공하지 않음
  };
};

// 책 API 서비스
export const bookService = {
  // 책 검색하기
  searchBooks: async (
    query: string,
    start = 1,
    display = 10
  ): Promise<ApiResponse<Book>> => {
    try {
      console.log(
        `구글 북스 API 책 검색 요청: "${query}", 시작=${start}, 개수=${display}`
      );

      // 구글 북스 API는 0-based 인덱스 사용, startIndex 계산
      const startIndex = (start - 1) * display;

      const response = await googleBooksApi.get("/volumes", {
        params: {
          q: query,
          startIndex,
          maxResults: display,
          langRestrict: "ko", // 한국어 도서 우선
          printType: "books",
          projection: "lite",
        },
      });

      const items = response.data.items || [];
      const totalItems = response.data.totalItems || 0;

      const books: Book[] = items.map(convertGoogleBookToBook);

      console.log(`구글 북스 API 책 검색 결과: ${books.length}개 도서 반환`);

      return {
        results: books,
        total_results: totalItems,
        page: Math.ceil(startIndex / display) + 1,
        total_pages: Math.ceil(totalItems / display),
      };
    } catch (error) {
      console.error(`책 검색 오류:`, error);
      // 에러 발생 시 빈 결과 반환
      return {
        results: [],
        total_results: 0,
        page: 1,
        total_pages: 0,
      };
    }
  },

  // 베스트셀러 가져오기
  getBestSellers: async (): Promise<ApiResponse<Book>> => {
    try {
      console.log("베스트셀러 요청");

      // 베스트셀러 검색어 조정 - API 문서 기반으로 최적화
      const response = await googleBooksApi.get("/volumes", {
        params: {
          q: "subject:bestseller OR subject:베스트셀러",
          maxResults: 20,
          langRestrict: "ko",
          orderBy: "relevance",
          printType: "books",
        },
      });

      const items = response.data.items || [];
      const totalItems = response.data.totalItems || 0;

      // 구글 북스 API 응답을 Book 타입으로 변환
      const books: Book[] = items.map(convertGoogleBookToBook);

      console.log(`베스트셀러 결과: ${books.length}개 도서 반환`);

      if (books.length === 0) {
        // 결과가 없으면 인기 소설 가져오기
        return await getFallbackBooks("인기 소설");
      }

      return {
        results: books,
        total_results: totalItems,
        page: 1,
        total_pages: Math.ceil(totalItems / 20),
      };
    } catch (error) {
      console.error("베스트셀러 가져오기 오류:", error);

      // 오류 발생 시 대체 도서 목록 가져오기
      return await getFallbackBooks("한국 소설");
    }
  },
};

// 대체 도서 가져오기 헬퍼 함수 추가
const getFallbackBooks = async (query: string): Promise<ApiResponse<Book>> => {
  try {
    console.log(`대체 도서 요청: ${query}`);
    const response = await googleBooksApi.get("/volumes", {
      params: {
        q: query,
        maxResults: 20,
        langRestrict: "ko",
        orderBy: "relevance",
        printType: "books",
      },
    });

    const items = response.data.items || [];
    const books: Book[] = items.map(convertGoogleBookToBook);

    console.log(`대체 도서 응답: ${books.length}개 도서 반환`);

    return {
      results: books,
      total_results: items.length,
      page: 1,
      total_pages: 1,
    };
  } catch (error) {
    console.error(`대체 도서 가져오기 오류 (${query}):`, error);
    return {
      results: [],
      total_results: 0,
      page: 1,
      total_pages: 0,
    };
  }
};
