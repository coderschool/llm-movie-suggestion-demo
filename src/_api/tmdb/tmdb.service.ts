import axios, { AxiosInstance } from "axios";
import { Movie, Genre } from "../../_types/movies";
import {
  MAX_PAGES_TO_FETCH,
  MIN_VOTE_AVERAGE,
  RESULTS_PER_PAGE,
  TMDB_BASE_URL,
} from "./tmdb.const";

export class TMDBService {
  private static instance: TMDBService;

  private tmdbApi: AxiosInstance;

  private readonly TMDB_API_KEY: string;

  private constructor() {
    this.TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

    if (!this.TMDB_API_KEY) {
      throw new Error(
        "TMDBService: TMDB API Key is missing. Please add VITE_TMDB_API_KEY to your .env file."
      );
    }

    this.tmdbApi = axios.create({
      baseURL: TMDB_BASE_URL,
      params: {
        api_key: this.TMDB_API_KEY,
        language: "en-US",
      },
    });
  }

  public static getInstance(): TMDBService {
    if (!TMDBService.instance) {
      TMDBService.instance = new TMDBService();
    }
    return TMDBService.instance;
  }

  /** Searches movies by query */
  public async searchMovies(query: string): Promise<Movie[]> {
    try {
      const response = await this.tmdbApi.get("/search/movie", {
        params: { query },
      });
      return response.data.results || [];
    } catch (error) {
      console.error("Error searching movies:", error);
      throw error;
    }
  }

  /** Fetches the list of official movie genres */
  public async getGenres(): Promise<Genre[]> {
    try {
      const response = await this.tmdbApi.get("/genre/movie/list");
      return response.data.genres || [];
    } catch (error) {
      console.error("Error fetching genres:", error);
      throw error;
    }
  }

  /** Discovers movies filtering by genre IDs, with randomness */
  public async discoverMoviesByGenre(
    genreIds: number[]
  ): Promise<Partial<Movie>[]> {
    if (!genreIds || genreIds.length === 0) return [];

    try {
      const pagePromises = [];
      for (let page = 1; page <= MAX_PAGES_TO_FETCH; page++) {
        pagePromises.push(
          this.tmdbApi.get("/discover/movie", {
            params: {
              with_genres: genreIds.join(","),
              sort_by: "popularity.desc",
              page: page,
              "vote_average.gte": MIN_VOTE_AVERAGE,
              "vote_count.gte": 100,
            },
          })
        );
      }

      const pageResponses = await Promise.all(pagePromises);

      let combinedResults: Partial<Movie>[] = [];
      pageResponses.forEach((response) => {
        if (response.data?.results) {
          combinedResults = combinedResults.concat(response.data.results);
        }
      });

      // Fisher-Yates shuffle
      for (let i = combinedResults.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [combinedResults[i], combinedResults[j]] = [
          combinedResults[j],
          combinedResults[i],
        ];
      }

      return combinedResults.slice(0, RESULTS_PER_PAGE);
    } catch (error) {
      console.error("Error discovering movies by genre:", error);
      throw error;
    }
  }

  /** Fetches detailed information for a single movie ID */
  public async getMovieDetails(movieId: number): Promise<Movie | null> {
    try {
      const response = await this.tmdbApi.get(`/movie/${movieId}`);
      return response.data as Movie;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.warn(`Movie ID ${movieId} not found on TMDB.`);
        return null;
      }
      console.error(`Error fetching details for movie ID ${movieId}:`, error);
      throw error;
    }
  }
}
