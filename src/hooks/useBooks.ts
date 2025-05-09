import { useState, useCallback, useEffect, useRef } from "react";
import { Book, ApiResponse } from "../types";
import { bookService } from "../services/api";

// 책 검색 훅
export const useBookSearch = () => {
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [query, setQuery] = useState("");
  const ITEMS_PER_PAGE = 10;

  // 책 검색
  const searchBooks = useCallback(async (searchQuery: string, pageNum = 1) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setTotalPages(0);
      setPage(1);
      return;
    }

    try {
      setLoading(true);
      setQuery(searchQuery);

      // 네이버 API의 시작 인덱스 계산 (1-based index)
      const start = (pageNum - 1) * ITEMS_PER_PAGE + 1;

      const response = await bookService.searchBooks(
        searchQuery,
        start,
        ITEMS_PER_PAGE
      );

      if (pageNum === 1) {
        setResults(response.results);
      } else {
        setResults((prev) => [...prev, ...response.results]);
      }

      setPage(pageNum);
      setTotalPages(response.total_pages || 0);
      setError(null);
    } catch (err) {
      setError("책 검색 중 오류가 발생했습니다");
      console.error("Error searching books:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 다음 페이지 로드
  const loadMore = useCallback(() => {
    if (loading || !query || (totalPages > 0 && page >= totalPages)) return;
    searchBooks(query, page + 1);
  }, [loading, page, query, searchBooks, totalPages]);

  return {
    results,
    loading,
    error,
    searchBooks,
    loadMore,
    query,
    page,
    totalPages,
  };
};

// 베스트셀러 가져오기 훅
export const useBestSellers = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBestSellers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await bookService.getBestSellers();
      setBooks(response.results);
      setError(null);
    } catch (err) {
      setError("베스트셀러를 불러오는 중 오류가 발생했습니다");
      console.error("Error fetching bestsellers:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBestSellers();
  }, [fetchBestSellers]);

  return {
    books,
    loading,
    error,
    refetch: fetchBestSellers,
  };
};

// 최신 출시 도서 가져오기 훅
export const useNewReleases = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isLoadingRef = useRef(false);

  const fetchNewReleases = useCallback(async () => {
    if (isLoadingRef.current) return;

    try {
      setLoading(true);
      isLoadingRef.current = true;
      console.log("최신 출시 도서 요청 중...");

      const response = await bookService.searchBooks("최신출간", 1, 15);
      setBooks(response.results);
      setError(null);

      console.log(
        `최신 출시 도서 응답: ${response.results.length}개 도서 받음`
      );
    } catch (err) {
      setError("최신 출시 도서를 불러오는 중 오류가 발생했습니다");
      console.error("Error fetching new releases:", err);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchNewReleases();
  }, [fetchNewReleases]);

  return {
    books,
    loading,
    error,
    refetch: fetchNewReleases,
  };
};

export const useRecommendedBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isLoadingRef = useRef(false);

  const fetchRecommendedBooks = useCallback(async () => {
    if (isLoadingRef.current) return;

    try {
      setLoading(true);
      isLoadingRef.current = true;
      console.log("추천 도서 요청 중...");

      const response = await bookService.searchBooks("추천도서", 1, 15);
      setBooks(response.results);
      setError(null);

      console.log(`추천 도서 응답: ${response.results.length}개 도서 받음`);
    } catch (err) {
      setError("추천 도서를 불러오는 중 오류가 발생했습니다");
      console.error("Error fetching recommended books:", err);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchRecommendedBooks();
  }, [fetchRecommendedBooks]);

  return {
    books,
    loading,
    error,
    refetch: fetchRecommendedBooks,
  };
};
