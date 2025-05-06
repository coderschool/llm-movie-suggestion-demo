import { create } from "zustand";
import { Movie, Genre } from "../_types/movies";
import { getLlmMovieSuggestions } from "../_api/llm/llm.ts";
import { getGenres } from "../_api/tmdb/tmdb.ts";
import { LlmResponse } from "../_api/llm/llm.util.ts";

interface MovieState {
  moods: string[];
  selectedGenreIds: number[];
  availableGenres: Genre[];
  suggestedMovies: Movie[];
  suggestionExplanation: string | null;
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
  suggestionExplanation: null,
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
    set({
      isFetchingSuggestions: true,
      error: null,
      suggestedMovies: [],
      suggestionExplanation: null,
    });

    const { moods, selectedGenreIds } = get();

    try {
      const llmResult: LlmResponse = await getLlmMovieSuggestions(
        moods,
        selectedGenreIds
      );
      set({
        suggestedMovies: llmResult.suggestions,
        suggestionExplanation: llmResult.explanation,
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
        suggestionExplanation: "Failed to fetch suggestions due to an error.",
      });
    }
  },
}));
