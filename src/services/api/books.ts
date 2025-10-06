import { ApiResponse, Book } from "../../types";
import {
  googleBooksApi,
  hasNaverBookCredentials,
  naverBookApi,
  PLACEHOLDER_IMAGE,
} from "./clients";

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
    price: 0,
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

export const bookService = {
  async searchBooks(
    query: string,
    start = 1,
    display = 10
  ): Promise<ApiResponse<Book>> {
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

  async getBestSellers(): Promise<ApiResponse<Book>> {
    if (hasNaverBookCredentials && naverBookApi) {
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
