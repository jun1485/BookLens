import axios, { AxiosInstance } from "axios";
import { ApiResponse, Movie, Book } from "../types";

const TMDB_API_KEY = process.env.TMDB_API_KEY;

// NAVER API 정보 (https://developers.naver.com/에서 발급)
const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/128x192?text=No+Cover";

const hasNaverBookCredentials = Boolean(
  NAVER_CLIENT_ID && NAVER_CLIENT_SECRET
);

const naverBookApi: AxiosInstance | null = hasNaverBookCredentials
  ? axios.create({
      baseURL: "https://openapi.naver.com/v1/search",
      timeout: 10000,
      headers: {
        "X-Naver-Client-Id": NAVER_CLIENT_ID ?? "",
        "X-Naver-Client-Secret": NAVER_CLIENT_SECRET ?? "",
      },
    })
  : null;

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

const cleanNaverText = (text?: string): string => {
  if (!text) {
    return "";
  }

  return text
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();
};

const parseNaverIsbn = (isbn?: string): string => {
  if (!isbn) {
    return "";
  }

  const parts = isbn
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    parts.find((code) => code.length === 13) ||
    parts.find((code) => code.length === 10) ||
    parts[0] ||
    ""
  );
};

const formatNaverDate = (pubdate?: string): string => {
  if (!pubdate) {
    return "";
  }

  if (pubdate.length === 8) {
    return `${pubdate.slice(0, 4)}-${pubdate.slice(4, 6)}-${pubdate.slice(6)}`;
  }

  if (pubdate.length === 6) {
    return `${pubdate.slice(0, 4)}-${pubdate.slice(4)}-01`;
  }

  if (pubdate.length === 4) {
    return `${pubdate}-01-01`;
  }

  return pubdate;
};

const convertNaverBookToBook = (item: any): Book => {
  const title = cleanNaverText(item.title);
  const authorText = cleanNaverText(item.author).replace(/\^/g, ", ");
  const publisher = cleanNaverText(item.publisher);
  const discountPrice = Number(item.discount);
  const listPrice = Number(item.price);
  const price =
    Number.isFinite(discountPrice) && discountPrice > 0
      ? discountPrice
      : Number.isFinite(listPrice) && listPrice > 0
        ? listPrice
        : 0;

  return {
    isbn: parseNaverIsbn(item.isbn) || item.link,
    title: title || "제목 없음",
    author: authorText || "작자 미상",
    description: cleanNaverText(item.description) || "설명 없음",
    cover_image: item.image || PLACEHOLDER_IMAGE,
    published_date: formatNaverDate(item.pubdate),
    publisher: publisher || "출판사 미상",
    price,
  };
};

// 구글 북스 API로 받은 데이터를 Book 타입으로 변환하는 함수
const convertGoogleBookToBook = (item: any): Book => {
  const volumeInfo = item.volumeInfo || {};
  const imageLinks = volumeInfo.imageLinks || {};
  const identifiers = volumeInfo.industryIdentifiers || [];
  const isbn13 = identifiers.find(
    (identifier: any) => identifier.type === "ISBN_13"
  );

  return {
    isbn: isbn13?.identifier || identifiers[0]?.identifier || item.id,
    title: (volumeInfo.title || "제목 없음").trim(),
    author: volumeInfo.authors?.join(", ") || "작자 미상",
    description: volumeInfo.description || "설명 없음",
    cover_image:
      imageLinks.thumbnail || imageLinks.smallThumbnail || PLACEHOLDER_IMAGE,
    published_date: volumeInfo.publishedDate || "",
    publisher: volumeInfo.publisher || "출판사 미상",
    price: 0, // 구글 북스 API는 가격 정보를 제공하지 않음
  };
};

const fetchBooksFromGoogle = async (
  query: string,
  page: number,
  display: number
): Promise<ApiResponse<Book>> => {
  try {
    console.log(
      `[구글] 책 검색 요청: "${query}", 페이지=${page}, 개수=${display}`
    );

    const startIndex = (page - 1) * display;

    const response = await googleBooksApi.get("/volumes", {
      params: {
        q: query,
        startIndex,
        maxResults: display,
        langRestrict: "ko",
        printType: "books",
        projection: "lite",
      },
    });

    const items = response.data.items || [];
    const totalItems = response.data.totalItems || 0;
    const books: Book[] = items.map(convertGoogleBookToBook);

    console.log(`[구글] 책 검색 결과: ${books.length}개 도서 반환`);

    return {
      results: books,
      total_results: totalItems,
      page: Math.floor(startIndex / display) + 1,
      total_pages: totalItems > 0 ? Math.ceil(totalItems / display) : 0,
    };
  } catch (error) {
    console.error(`[구글] 책 검색 오류:`, error);
    return {
      results: [],
      total_results: 0,
      page: 1,
      total_pages: 0,
    };
  }
};

const fetchBooksFromNaver = async (
  query: string,
  page: number,
  display: number
): Promise<ApiResponse<Book>> => {
  if (!naverBookApi) {
    throw new Error("네이버 도서 API가 구성되지 않았습니다.");
  }

  const sanitizedDisplay = Math.max(1, Math.min(display, 100));
  const rawStart = (page - 1) * sanitizedDisplay + 1;
  const maxStart = Math.max(1, 1000 - sanitizedDisplay + 1);
  const start = Math.min(Math.max(rawStart, 1), maxStart);

  console.log(
    `[네이버] 책 검색 요청: "${query}", 페이지=${page}, 표시=${sanitizedDisplay}`
  );

  const response = await naverBookApi.get("/book.json", {
    params: {
      query,
      display: sanitizedDisplay,
      start,
      sort: "sim",
    },
  });

  const items = response.data.items || [];
  const total = response.data.total ?? 0;
  const availableTotal = total > 0 ? Math.min(total, 1000) : 0;
  const books: Book[] = items.map(convertNaverBookToBook);

  console.log(`[네이버] 책 검색 결과: ${books.length}개 도서 반환`);

  return {
    results: books,
    total_results: availableTotal,
    page: Math.floor((start - 1) / sanitizedDisplay) + 1,
    total_pages:
      availableTotal > 0 ? Math.ceil(availableTotal / sanitizedDisplay) : 0,
  };
};

const getFallbackBooks = async (
  query: string
): Promise<ApiResponse<Book>> => {
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
      total_pages: books.length > 0 ? 1 : 0,
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

const fetchBestSellersFromGoogle = async (): Promise<ApiResponse<Book>> => {
  try {
    console.log("[구글] 베스트셀러 요청");

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
    const books: Book[] = items.map(convertGoogleBookToBook);

    console.log(`구글 베스트셀러 결과: ${books.length}개 도서 반환`);

    if (books.length === 0) {
      return await getFallbackBooks("인기 소설");
    }

    return {
      results: books,
      total_results: totalItems,
      page: 1,
      total_pages: totalItems > 0 ? Math.ceil(totalItems / 20) : 0,
    };
  } catch (error) {
    console.error("[구글] 베스트셀러 가져오기 오류:", error);
    return await getFallbackBooks("한국 소설");
  }
};

const fetchBestSellersFromNaver = async (): Promise<ApiResponse<Book>> => {
  if (!naverBookApi) {
    throw new Error("네이버 도서 API가 구성되지 않았습니다.");
  }

  const display = 20;

  console.log("[네이버] 베스트셀러 요청");
  const response = await naverBookApi.get("/book.json", {
    params: {
      query: "베스트셀러",
      display,
      start: 1,
      sort: "count",
    },
  });

  const items = response.data.items || [];
  const total = response.data.total ?? items.length;
  const books: Book[] = items.map(convertNaverBookToBook);

  console.log(`[네이버] 베스트셀러 결과: ${books.length}개 도서 반환`);

  return {
    results: books,
    total_results: total,
    page: 1,
    total_pages: total > 0 ? Math.ceil(total / display) : 0,
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
    if (naverBookApi) {
      try {
        const naverResult = await fetchBooksFromNaver(query, start, display);

        if (naverResult.results.length > 0) {
          return naverResult;
        }

        console.warn(
          "네이버 API에서 검색 결과가 없어 구글 API로 대체합니다."
        );
      } catch (error) {
        console.error("네이버 책 검색 오류:", error);
      }
    }

    return await fetchBooksFromGoogle(query, start, display);
  },

  // 베스트셀러 가져오기
  getBestSellers: async (): Promise<ApiResponse<Book>> => {
    if (naverBookApi) {
      try {
        const naverResult = await fetchBestSellersFromNaver();

        if (naverResult.results.length > 0) {
          return naverResult;
        }

        console.warn(
          "네이버 베스트셀러 결과가 비어 있어 구글 API로 대체합니다."
        );
      } catch (error) {
        console.error("네이버 베스트셀러 가져오기 오류:", error);
      }
    }

    return await fetchBestSellersFromGoogle();
  },
};
