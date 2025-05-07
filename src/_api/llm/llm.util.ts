import { Genre, Movie } from "../../_types/movies";
import { LLM_MOVIE_AGENT_PROMPT } from "./llm.const";

export interface LlmResponse {
  suggestions: Movie[];
  explanation: string | null;
}

export const formatInitialPrompt = (
  selectedMoods: string[],
  selectedGenreIds: number[],
  availableGenres: Genre[]
): string => {
  return LLM_MOVIE_AGENT_PROMPT.replace(
    "{{SELECTED_MOODS}}",
    JSON.stringify(selectedMoods)
  )
    .replace("{{SELECTED_GENRE_IDS}}", JSON.stringify(selectedGenreIds))
    .replace(
      "{{AVAILABLE_GENRES_CONTEXT}}",
      JSON.stringify(availableGenres.map((g) => `${g.name} (ID: ${g.id})`))
    );
};

export const parseFinalLlmResponse = (llmTextResponse: string): LlmResponse => {
  const rawText = llmTextResponse.trim();
  const defaultResponse: LlmResponse = {
    suggestions: [],
    explanation: "Failed to parse LLM response or no explanation provided.",
  };

  try {
    let cleanedJsonText = rawText.replace(/^```(?:json)?\s*|```$/gi, "");
    // Replace Python-style booleans with JSON-style booleans
    cleanedJsonText = cleanedJsonText
      .replace(/\bTrue\b/g, "true")
      .replace(/\bFalse\b/g, "false");
    const validJsonText = cleanedJsonText.replace(/\\'/g, "'");

    const parsedData = JSON.parse(validJsonText);

    // Check if parsedData is an object and has the suggestions and explanation properties
    if (
      typeof parsedData === "object" &&
      parsedData !== null &&
      Array.isArray(parsedData.suggestions) &&
      (typeof parsedData.explanation === "string" ||
        parsedData.explanation === null)
    ) {
      const suggestionsData = parsedData.suggestions as Movie[];
      const explanation = parsedData.explanation as string | null;

      // Basic validation for movie objects
      if (
        suggestionsData.length > 0 &&
        (suggestionsData[0] === null ||
          typeof suggestionsData[0]?.id !== "number" ||
          typeof suggestionsData[0]?.title !== "string" ||
          (suggestionsData[0]?.reason !== undefined &&
            typeof suggestionsData[0]?.reason !== "string"))
      ) {
        console.warn(
          "Parsed suggestions array might contain non-Movie objects or nulls, or invalid 'reason' field. First element:",
          suggestionsData[0]
        );
      }
      return {
        suggestions: suggestionsData
          .filter((movie) => movie !== null)
          .map((movie) => ({ ...movie, reason: movie.reason || undefined })),
        explanation: explanation ?? "No explanation provided by the LLM.",
      };
    }
    // Handle old format (array only) for backward compatibility or if LLM makes a mistake
    if (Array.isArray(parsedData)) {
      console.warn(
        "LLM returned an array instead of an object with suggestions and explanation. Handling as suggestions only."
      );
      return {
        suggestions: parsedData.filter((movie) => movie !== null) as Movie[],
        explanation: "LLM returned an array; no explanation field was present.",
      };
    }

    throw new Error(
      "LLM final response is not a JSON object with 'suggestions' and 'explanation' keys as expected."
    );
  } catch (parseError) {
    console.error(
      "Error parsing final LLM JSON (expected object with suggestions and explanation):",
      parseError,
      "Cleaned text:",
      rawText.replace(/^```(?:json)?\s*|```$/gi, "")
    );
    return defaultResponse;
  }
};
