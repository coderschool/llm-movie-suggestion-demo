import axios from "axios";

import { getGenres } from "../tmdb/tmdb.ts";

import { GEMINI_MODEL_NAME, API_BASE_URL } from "./llm.const.ts";
import {
  GeminiPart,
  GeminiFunctionCall,
  GeminiToolSet,
  GeminiRole,
  GeminiRequestBody,
} from "./llm.type.ts";
import { History } from "./components/history.ts";

import { executeTool, tools as geminiTools } from "./components/tooling.ts";
import {
  formatInitialPrompt,
  parseFinalLlmResponse,
  LlmResponse,
} from "./llm.util.ts";

// --- Helper Function: Interaction Loop ---
const runLlmInteractionLoop = async (
  historyManager: History,
  tools: GeminiToolSet[],
  requestUrl: string
): Promise<string> => {
  while (true) {
    const currentHistory = historyManager.getHistory();

    const lastTurn =
      currentHistory.length > 0
        ? currentHistory[currentHistory.length - 1]
        : null;
    const expectingTextResponse = lastTurn?.role === GeminiRole.TOOL;

    const requestBody: GeminiRequestBody = {
      contents: currentHistory,
      ...(expectingTextResponse
        ? { toolConfig: { functionCallingConfig: { mode: "NONE" } } }
        : { tools: tools }),
    };

    const finalRequestUrl = requestUrl;

    const currentResponse = await axios.post(finalRequestUrl, requestBody, {
      headers: { "Content-Type": "application/json" },
      timeout: 60000,
    });

    const responseCandidate = currentResponse.data?.candidates?.[0];
    if (!responseCandidate?.content?.parts) {
      console.error(
        "[runLlmInteractionLoop] Invalid response structure (missing parts):",
        currentResponse.data
      );
      throw new Error("Received invalid response structure from LLM.");
    }

    const functionCallPart = responseCandidate.content.parts.find(
      (part: GeminiPart) => part.functionCall
    );

    const functionCall = functionCallPart?.functionCall as
      | GeminiFunctionCall
      | undefined;

    if (functionCall) {
      historyManager.addModelFunctionCall(functionCall);

      const functionResponseData = await executeTool(functionCall);

      historyManager.addToolResponse(functionCall.name, functionResponseData);
    } else {
      const finalResponsePart = responseCandidate.content.parts.find(
        (part: GeminiPart) => typeof part.text === "string"
      );

      if (finalResponsePart?.text) {
        return finalResponsePart.text;
      } else {
        console.error(
          "[runLlmInteractionLoop] LLM response ended without text/call:",
          currentResponse.data
        );
        throw new Error("LLM did not provide a function call or final text.");
      }
    }
  }
};

// --- Main Exported Function ---
export const getLlmMovieSuggestions = async (
  selectedMoods: string[],
  selectedGenreIds: number[]
): Promise<LlmResponse> => {
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    console.warn("Skipping LLM suggestions: Gemini API Key is missing.");
    return { suggestions: [], explanation: "Gemini API Key is missing." };
  }

  try {
    const availableGenres = await getGenres();

    const formattedPrompt = formatInitialPrompt(
      selectedMoods,
      selectedGenreIds,
      availableGenres
    );

    const historyManager = new History(formattedPrompt);

    const requestUrl = `${API_BASE_URL}/${GEMINI_MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;

    const finalTextResponse = await runLlmInteractionLoop(
      historyManager,
      geminiTools,
      requestUrl
    );

    const finalLlmOutput = parseFinalLlmResponse(finalTextResponse);

    return finalLlmOutput;
  } catch (error) {
    console.error("Error during LLM suggestion process:");
    let errorMessage = "Failed to get movie suggestions.";

    if (axios.isAxiosError(error)) {
      const geminiError = error.response?.data?.error?.message;
      if (geminiError) {
        errorMessage = `Gemini API Error: ${geminiError}`;
      } else if (error.response?.status) {
        errorMessage = `HTTP Error: ${error.response.status}`;
      } else if (error.code) {
        errorMessage = `Network Error: ${error.code}`;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = "An unknown error occurred processing suggestions.";
    }
    console.error(
      "Consolidated Error (returning empty suggestions):",
      errorMessage
    );
    return { suggestions: [], explanation: errorMessage };
  }
};
