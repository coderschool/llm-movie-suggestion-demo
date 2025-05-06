import {
  getMoviesByGenreTool,
  getMoviesByGenreToolHandler,
} from "../llm-tools/get-movies-by-genre";
// Comment out the second tool import
/*
import {
  getMovieDetailsByIdsTool,
  getMovieDetailsByIdsToolHandler,
} from "../llm-tools/get-movie-details-by-ids";
*/
import { GeminiFunctionCall, GeminiToolSet } from "../llm.type";
// Remove TmdbService import
// import { TmdbService } from "../../tmdb/tmdb.service.ts";

// Export tools array directly
export const tools: GeminiToolSet[] = [
  {
    // Only include the first tool definition
    functionDeclarations: [getMoviesByGenreTool /*, getMovieDetailsByIdsTool*/],
  },
];

// Export executeTool as standalone function
// Remove tmdb parameter
export const executeTool = async (
  functionCall: GeminiFunctionCall
): Promise<unknown> => {
  const { name, args } = functionCall;
  // console.log(
  //   `[executeTool] Attempting to execute tool: ${name} with args:`,
  //   JSON.stringify(args, null, 2)
  // );

  try {
    if (name === "get_movies_by_genre") {
      // Call handler without tmdb instance
      return await getMoviesByGenreToolHandler(args);
    }
    // Comment out the execution path for the second tool
    /*
    if (name === "get_movie_details_by_ids") {
      // Call handler without tmdb instance
      // return await getMovieDetailsByIdsToolHandler(args);
    }
    */

    const errorMsg = `Unknown tool function requested by LLM: ${name}`;
    console.error(errorMsg);
    return { error: errorMsg };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`!!! Tool execution error for ${name}:`, errorMsg);
    return { error: `Tool execution failed for ${name}: ${errorMsg}` };
  }
};
