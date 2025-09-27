import { useCallback, useState } from "react";

import { Book } from "../../../types";
import { bookService } from "../api/bookService";

const ITEMS_PER_PAGE = 10;

export const useBookSearch = () => {
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [query, setQuery] = useState("");

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

      const start = (pageNum - 1) * ITEMS_PER_PAGE + 1;
      const response = await bookService.searchBooks(
        searchQuery,
        start,
        ITEMS_PER_PAGE
      );

      setResults((prev) =>
        pageNum === 1 ? response.results : [...prev, ...response.results]
      );

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
