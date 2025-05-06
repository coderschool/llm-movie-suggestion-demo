import { Movie } from "../../../_types/movies.ts";
import { getMovieDetails } from "../../tmdb/tmdb.ts";
import { GeminiFunctionDeclaration } from "../llm.type.ts";

// --- Tool Definition for Gemini ---
export const getMovieDetailsByIdsTool: GeminiFunctionDeclaration = {
  name: "get_movie_details_by_ids",
  description:
    "Fetches full details for a list of movie IDs from TMDB. Filters out movies that are not found.",
  parameters: {
    type: "object",
    properties: {
      movieIds: {
        type: "array",
        items: { type: "number" },
        description: "An array of TMDB movie IDs to fetch details for.",
      },
    },
    required: ["movieIds"],
  },
};

// --- Tool Handler ---
export const getMovieDetailsByIdsToolHandler = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: any
): Promise<Movie[]> => {
  const movieIds = args?.movieIds as number[] | undefined;

  if (!movieIds || !Array.isArray(movieIds) || movieIds.length === 0) {
    console.error("Invalid or missing movieIds in tool arguments:", args);
    return [];
  }

  try {
    // Use Promise.all to fetch details concurrently
    const movieDetailsPromises = movieIds.map((id) =>
      // Call the method on the passed tmdb instance
      getMovieDetails(id)
    );

    const movies = await Promise.all(movieDetailsPromises);
    // Filter out any null results (movies not found)

    console.log("movies in DETAILS TOOL", movies);

    return movies.filter(
      (movie: Movie | null): movie is Movie => movie !== null
    );
  } catch (error) {
    console.error(
      `Error calling tmdb.getMovieDetails for IDs ${movieIds}:`,
      error
    );
    return [];
  }
};
