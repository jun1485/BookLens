import { useCallback, useEffect, useState } from "react";

import { Book } from "../../../types";
import { bookService } from "../api/bookService";

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
