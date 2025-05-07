import {
  getMoviesByGenreTool,
  getMoviesByGenreToolHandler,
} from "../llm-tools/get-movies-by-genre";

import { GeminiFunctionCall, GeminiToolSet } from "../llm.type";

export class ToolingService {
  public static readonly tools: GeminiToolSet[] = [
    {
      functionDeclarations: [getMoviesByGenreTool],
    },
  ];

  public static async executeTool(
    functionCall: GeminiFunctionCall
  ): Promise<unknown> {
    const { name, args } = functionCall;
    console.log(`>>> Executing Tool: ${name}`, args);
    try {
      if (name === "get_movies_by_genre") {
        return await getMoviesByGenreToolHandler(args);
      }

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
