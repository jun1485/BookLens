import { tmdbApi } from "../../../shared/api/tmdbClient";
import { ApiResponse, Movie } from "../../../types";

export const movieService = {
  async getPopular(page = 1): Promise<ApiResponse<Movie>> {
    try {
      console.log(`인기 영화 요청: 페이지 ${page}`);
      const response = await tmdbApi.get("/movie/popular", {
        params: { page },
      });

      if (response.data.page !== page) {
        console.warn(`페이지 불일치: 요청=${page}, 응답=${response.data.page}`);
      }

      return response.data;
    } catch (error) {
      console.error(`인기 영화 가져오기 오류(페이지 ${page}):`, error);
      throw error;
    }
  },

  async searchMovies(query: string, page = 1): Promise<ApiResponse<Movie>> {
    const response = await tmdbApi.get("/search/movie", {
      params: { query, page },
    });
    return response.data;
  },

  async getMovieDetails(movieId: number): Promise<Movie> {
    const response = await tmdbApi.get(`/movie/${movieId}`);
    return response.data;
  },

  async getMoviesByGenre(
    genreId: number,
    page = 1
  ): Promise<ApiResponse<Movie>> {
    const response = await tmdbApi.get("/discover/movie", {
      params: { with_genres: genreId, page },
    });
    return response.data;
  },
};
