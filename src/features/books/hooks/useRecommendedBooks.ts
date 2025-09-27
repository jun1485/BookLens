import { useCallback, useEffect, useRef, useState } from "react";

import { Book } from "../../../types";
import { bookService } from "../api/bookService";

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
