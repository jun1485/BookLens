import { useCallback, useEffect, useRef, useState } from "react";

import { Movie } from "../../../types";
import { movieService } from "../api/movieService";

export const usePopularMovies = (initialPage = 1) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);

  const isLoadingRef = useRef(false);

  const fetchPopularMovies = useCallback(async (pageNum: number) => {
    if (isLoadingRef.current) return;

    try {
      setLoading(true);
      isLoadingRef.current = true;
      console.log(`실제 페이지 요청: ${pageNum}`);
      const response = await movieService.getPopular(pageNum);

      setMovies((prev) =>
        pageNum === 1 ? response.results : [...prev, ...response.results]
      );

      setPage(pageNum);
      setTotalPages(response.total_pages || 0);
      setError(null);
    } catch (err) {
      setError("인기 영화를 불러오는 중 오류가 발생했습니다");
      console.error("Error fetching popular movies:", err);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchPopularMovies(initialPage);
  }, [fetchPopularMovies, initialPage]);

  const loadMore = useCallback(() => {
    if (
      loading ||
      isLoadingRef.current ||
      (totalPages > 0 && page >= totalPages)
    ) {
      return;
    }

    console.log(
      `Loading more movies... Current page: ${page}, Next page: ${page + 1}`
    );
    fetchPopularMovies(page + 1);
  }, [fetchPopularMovies, loading, page, totalPages]);

  const refresh = useCallback(() => {
    fetchPopularMovies(1);
  }, [fetchPopularMovies]);

  return {
    movies,
    loading,
    error,
    loadMore,
    refresh,
    page,
    totalPages,
  };
};
