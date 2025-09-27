import { useCallback, useEffect, useState } from "react";

import { Movie } from "../../../types";
import { movieService } from "../api/movieService";

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
