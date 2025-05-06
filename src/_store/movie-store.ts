import { create } from "zustand";
import { Movie, Genre } from "../_types/movies";
import { getLlmMovieSuggestions } from "../_services/llm/llm.ts";
import { getGenres } from "../_services/tmdb/tmdb.ts";

interface MovieState {
  moods: string[];
  selectedGenreIds: number[];
  availableGenres: Genre[];
  suggestedMovies: Movie[];
  isFetchingGenres: boolean;
  isFetchingSuggestions: boolean;
  error: string | null;
  setMoods: (mood: string) => void;
  setSelectedGenreIds: (genreId: number) => void;
  fetchAvailableGenres: () => Promise<void>;
  fetchSuggestions: () => Promise<void>;
}

const toggleArrayItem = <T>(array: T[], item: T): T[] => {
  return array.includes(item)
    ? array.filter((i) => i !== item)
    : [...array, item];
};

export const useMovieStore = create<MovieState>((set, get) => ({
  moods: [],
  selectedGenreIds: [],
  availableGenres: [],
  suggestedMovies: [],
  isFetchingGenres: false,
  isFetchingSuggestions: false,
  error: null,
  setMoods: (mood) =>
    set((state) => ({ moods: toggleArrayItem(state.moods, mood) })),
  setSelectedGenreIds: (genreId) =>
    set((state) => ({
      selectedGenreIds: toggleArrayItem(state.selectedGenreIds, genreId),
    })),
  fetchAvailableGenres: async () => {
    if (get().availableGenres.length > 0 || get().isFetchingGenres) return;
    set({ isFetchingGenres: true, error: null });
    try {
      const genres = await getGenres();
      set({ availableGenres: genres || [], isFetchingGenres: false });
    } catch (error) {
      console.error("Failed to fetch TMDB genres:", error);
      set({
        error: "Failed to load genres from TMDB. Check API key or service.",
        isFetchingGenres: false,
        availableGenres: [],
      });
    }
  },
  fetchSuggestions: async () => {
    if (get().isFetchingSuggestions) return;
    set({ isFetchingSuggestions: true, error: null, suggestedMovies: [] });

    const { moods, selectedGenreIds } = get();

    try {
      const movies: Movie[] = await getLlmMovieSuggestions(
        moods,
        selectedGenreIds
      );
      set({
        suggestedMovies: movies,
        isFetchingSuggestions: false,
        error: null,
      });
    } catch (error: unknown) {
      console.error("Caught error in movie store fetchSuggestions:", error);
      let errorMessage = "An unexpected error occurred.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      set({
        error: errorMessage,
        isFetchingSuggestions: false,
        suggestedMovies: [],
      });
    }
  },
}));
