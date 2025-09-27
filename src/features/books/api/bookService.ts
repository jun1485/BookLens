import { googleBooksApi } from "../../../shared/api/googleBooksClient";
import { ApiResponse, Book } from "../../../types";

const DEFAULT_MAX_RESULTS = 20;

const createEmptyResponse = (): ApiResponse<Book> => ({
  results: [],
  total_results: 0,
  page: 1,
  total_pages: 0,
});

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
    price: 0,
  };
};

const buildPagedResponse = (
  books: Book[],
  totalItems: number,
  startIndex: number,
  pageSize: number
): ApiResponse<Book> => ({
  results: books,
  total_results: totalItems,
  page: Math.ceil(startIndex / pageSize) + 1,
  total_pages: Math.ceil(totalItems / pageSize),
});

const requestBooks = async (
  params: Record<string, string | number>
): Promise<ApiResponse<Book>> => {
  const response = await googleBooksApi.get("/volumes", { params });
  const items = response.data.items || [];
  const totalItems = response.data.totalItems || 0;
  const books: Book[] = items.map(convertGoogleBookToBook);

  console.log(`구글 북스 API 응답: ${books.length}개 도서 반환`);

  const startIndex = Number(params.startIndex ?? 0);
  const pageSize = Number(params.maxResults ?? DEFAULT_MAX_RESULTS);

  return buildPagedResponse(books, totalItems, startIndex, pageSize);
};

const getFallbackBooks = async (query: string): Promise<ApiResponse<Book>> => {
  try {
    console.log(`대체 도서 요청: ${query}`);
    return await requestBooks({
      q: query,
      maxResults: DEFAULT_MAX_RESULTS,
      langRestrict: "ko",
      orderBy: "relevance",
      printType: "books",
    });
  } catch (error) {
    console.error(`대체 도서 가져오기 오류 (${query}):`, error);
    return createEmptyResponse();
  }
};

export const bookService = {
  async searchBooks(
    query: string,
    start = 1,
    display = 10
  ): Promise<ApiResponse<Book>> {
    if (!query.trim()) {
      return createEmptyResponse();
    }

    try {
      console.log(
        `구글 북스 API 책 검색 요청: "${query}", 시작=${start}, 개수=${display}`
      );

      const startIndex = (start - 1) * display;

      return await requestBooks({
        q: query,
        startIndex,
        maxResults: display,
        langRestrict: "ko",
        printType: "books",
        projection: "lite",
      });
    } catch (error) {
      console.error(`책 검색 오류:`, error);
      return createEmptyResponse();
    }
  },

  async getBestSellers(): Promise<ApiResponse<Book>> {
    try {
      console.log("베스트셀러 요청");

      const response = await requestBooks({
        q: "subject:bestseller OR subject:베스트셀러",
        maxResults: DEFAULT_MAX_RESULTS,
        langRestrict: "ko",
        orderBy: "relevance",
        printType: "books",
      });

      if (response.results.length === 0) {
        return await getFallbackBooks("인기 소설");
      }

      return response;
    } catch (error) {
      console.error("베스트셀러 가져오기 오류:", error);
      return await getFallbackBooks("한국 소설");
    }
  },
};
