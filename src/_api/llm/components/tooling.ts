import {
  getMoviesByGenreTool,
  getMoviesByGenreToolHandler,
} from "../llm-tools/get-movies-by-genre";

import { GeminiFunctionCall, GeminiToolSet } from "../llm.type";

export class ToolingService {
  // Export tools array directly as a static readonly property
  public static readonly tools: GeminiToolSet[] = [
    {
      functionDeclarations: [
        getMoviesByGenreTool /*, getMovieDetailsByIdsTool*/,
      ],
    },
  ];

  // Export executeTool as a static public method
  public static async executeTool(
    functionCall: GeminiFunctionCall
  ): Promise<unknown> {
    const { name, args } = functionCall;
    console.log(`>>> Executing Tool: ${name}`, args);
    try {
      if (name === "get_movies_by_genre") {
        // Call handler
        return await getMoviesByGenreToolHandler(args);
      }
      // Comment out the execution path for the second tool
      /*
      if (name === "get_movie_details_by_ids") {
        // Call handler
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
  }
}
