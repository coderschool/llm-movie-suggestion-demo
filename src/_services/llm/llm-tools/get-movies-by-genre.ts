import { discoverMoviesByGenre } from "../../tmdb/tmdb";
import { Movie } from "../../../_types/movies";
import { GeminiFunctionDeclaration } from "../llm.type";

// --- Tool Definition for Gemini ---
export const getMoviesByGenreTool: GeminiFunctionDeclaration = {
  name: "get_movies_by_genre",
  description:
    "Retrieves a list of movies from TMDB matching the provided genre IDs. Returns partial movie info including id, title, overview, poster_path, vote_average, and genre_ids.",
  parameters: {
    type: "object",
    properties: {
      genreIds: {
        type: "array",
        items: { type: "number" },
        description: "An array of TMDB genre IDs to filter by.",
      },
    },
    required: ["genreIds"],
  },
};

// --- Tool Handler ---
export const getMoviesByGenreToolHandler = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: any
): Promise<Partial<Movie>[]> => {
  const genreIds = args?.genreIds as number[] | undefined;
  if (!genreIds || !Array.isArray(genreIds) || genreIds.length === 0) {
    console.error("Invalid or missing genreIds in tool arguments:", args);
    return [];
  }

  try {
    const movies = await discoverMoviesByGenre(genreIds);
    return movies;
  } catch (error) {
    console.error(
      `Error calling discoverMoviesByGenre for genres ${genreIds}:`,
      error
    );
    return [];
  }
};
