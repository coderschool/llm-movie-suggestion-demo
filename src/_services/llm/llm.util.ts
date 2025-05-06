import { Genre, Movie } from "../../_types/movies";
import { LLM_MOVIE_AGENT_PROMPT } from "./llm.const";

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

export const parseFinalLlmResponse = (llmTextResponse: string): Movie[] => {
  const rawText = llmTextResponse.trim();

  try {
    const cleanedJsonText = rawText.replace(/^```(?:json)?\s*|```$/gi, "");
    const validJsonText = cleanedJsonText.replace(/\\'/g, "'");

    const suggestionsData = JSON.parse(validJsonText);

    if (!Array.isArray(suggestionsData)) {
      // If the LLM returns the error object { suggestions: [], explanation: "..." } by mistake, handle it gracefully.
      if (
        typeof suggestionsData === "object" &&
        suggestionsData !== null &&
        Array.isArray(suggestionsData.suggestions)
      ) {
        console.warn(
          "LLM returned object with suggestions key instead of array. Extracting suggestions."
        );
        return suggestionsData.suggestions as Movie[];
      }
      throw new Error("LLM final response is not a JSON array as expected.");
    }

    // Basic validation: check if elements look like movies (have id and title)
    if (
      suggestionsData.length > 0 &&
      (suggestionsData[0] === null || // Handle cases where array might contain null
        typeof suggestionsData[0]?.id !== "number" ||
        typeof suggestionsData[0]?.title !== "string")
    ) {
      // If the first element is problematic, but it's an array, consider returning empty or logging more.
      // For now, let's assume if it's an array, it's intended to be Movie[] or empty.
      console.warn(
        "Parsed suggestions array might contain non-Movie objects or nulls. First element:",
        suggestionsData[0]
      );
    }

    return suggestionsData.filter((movie) => movie !== null) as Movie[]; // Filter out potential nulls and cast
  } catch (parseError) {
    console.error(
      "Error parsing final LLM JSON (expected array):",
      parseError,
      "Cleaned text:",
      rawText.replace(/^```(?:json)?\s*|```$/gi, "")
    );
    // For robustness, return empty array if parsing fails or format is wrong
    return [];
    // Or re-throw: throw new Error(`Failed to parse final suggestions from LLM. Raw response: ${rawText}`);
  }
};
