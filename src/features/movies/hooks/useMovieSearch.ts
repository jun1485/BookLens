import { useCallback, useState } from "react";

import { Movie } from "../../../types";
import { movieService } from "../api/movieService";

export const useMovieSearch = () => {
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [query, setQuery] = useState("");

  const searchMovies = useCallback(async (searchQuery: string, pageNum = 1) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setTotalPages(0);
      setPage(1);
      return;
    }

    try {
      setLoading(true);
      setQuery(searchQuery);

      const response = await movieService.searchMovies(searchQuery, pageNum);

      setResults((prev) =>
        pageNum === 1 ? response.results : [...prev, ...response.results]
      );

      setPage(pageNum);
      setTotalPages(response.total_pages || 0);
      setError(null);
    } catch (err) {
      setError("영화 검색 중 오류가 발생했습니다");
      console.error("Error searching movies:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (loading || !query || (totalPages > 0 && page >= totalPages)) return;
    searchMovies(query, page + 1);
  }, [loading, page, query, searchMovies, totalPages]);

  return {
    results,
    loading,
    error,
    searchMovies,
    loadMore,
    query,
    page,
    totalPages,
  };
};
