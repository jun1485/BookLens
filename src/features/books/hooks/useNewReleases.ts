import { useCallback, useEffect, useRef, useState } from "react";

import { Book } from "../../../types";
import { bookService } from "../api/bookService";

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
