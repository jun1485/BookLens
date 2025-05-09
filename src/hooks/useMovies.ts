import { useState, useCallback, useEffect, useRef } from "react";
import { Movie, ApiResponse } from "../types";
import { movieService } from "../services/api";

// 영화 목록 가져오기 훅
export const useMovies = (initialPage = 1) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);

  const isLoadingRef = useRef(false);

  // 인기 영화 가져오기
  const fetchPopularMovies = useCallback(async (pageNum: number) => {
    if (isLoadingRef.current) return;

    try {
      setLoading(true);
      isLoadingRef.current = true;
      console.log(`실제 페이지 요청: ${pageNum}`);
      const response = await movieService.getPopular(pageNum);

      if (pageNum === 1) {
        setMovies(response.results);
      } else {
        setMovies((prev) => [...prev, ...response.results]);
      }

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

  // 초기 데이터 로드
  useEffect(() => {
    fetchPopularMovies(initialPage);
  }, [fetchPopularMovies, initialPage]);

  // 다음 페이지 로드
  const loadMore = useCallback(() => {
    // 로딩 중이거나 마지막 페이지에 도달한 경우 중단
    if (
      loading ||
      isLoadingRef.current ||
      (totalPages > 0 && page >= totalPages)
    )
      return;
    console.log(
      `Loading more movies... Current page: ${page}, Next page: ${page + 1}`
    );
    fetchPopularMovies(page + 1);
  }, [fetchPopularMovies, loading, page, totalPages]);

  // 새로고침
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

// 영화 검색 훅
export const useMovieSearch = () => {
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [query, setQuery] = useState("");

  // 영화 검색
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

      if (pageNum === 1) {
        setResults(response.results);
      } else {
        setResults((prev) => [...prev, ...response.results]);
      }

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

  // 다음 페이지 로드
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

// 영화 상세 정보 가져오기 훅
export const useMovieDetails = (movieId: number) => {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMovieDetails = useCallback(async () => {
    try {
      setLoading(true);
      const movieData = await movieService.getMovieDetails(movieId);
      setMovie(movieData);
      setError(null);
    } catch (err) {
      setError("영화 상세 정보를 불러오는 중 오류가 발생했습니다");
      console.error("Error fetching movie details:", err);
    } finally {
      setLoading(false);
    }
  }, [movieId]);

  useEffect(() => {
    fetchMovieDetails();
  }, [fetchMovieDetails]);

  return {
    movie,
    loading,
    error,
    refetch: fetchMovieDetails,
  };
};
