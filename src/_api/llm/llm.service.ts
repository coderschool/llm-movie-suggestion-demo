import axios, { AxiosInstance } from "axios";
import { TMDBService } from "../tmdb/tmdb.service";
import { GEMINI_MODEL_NAME, API_BASE_URL } from "./llm.const";
import {
  GeminiPart,
  GeminiFunctionCall,
  GeminiToolSet,
  GeminiRole,
  GeminiRequestBody,
} from "./llm.type";
import { History } from "./components/history";
import { ToolingService } from "./components/tooling";
import {
  formatInitialPrompt,
  parseFinalLlmResponse,
  LlmResponse,
} from "./llm.util";

export class LLMService {
  private static instance: LLMService;

  private llmClient: AxiosInstance;

  private GEMINI_API_KEY: string;

  private constructor() {
    this.GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!this.GEMINI_API_KEY) {
      throw new Error(
        "LLMService: Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file."
      );
    }

    this.llmClient = axios.create({
      baseURL: API_BASE_URL,
      headers: { "Content-Type": "application/json" },
      timeout: 60000,
    });
  }

  public static getInstance(): LLMService {
    if (!LLMService.instance) {
      LLMService.instance = new LLMService();
    }
    return LLMService.instance;
  }

  private async runLlmInteractionLoop(
    historyManager: History,
    tools: GeminiToolSet[]
  ): Promise<string> {
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

      const requestUrl = `${GEMINI_MODEL_NAME}:generateContent?key=${this.GEMINI_API_KEY}`;

      const currentResponse = await this.llmClient.post(
        requestUrl,
        requestBody
      );

      const responseCandidate = currentResponse.data?.candidates?.[0];
      if (!responseCandidate?.content?.parts) {
        console.error(
          "[LLMService.runLlmInteractionLoop] Invalid response structure (missing parts):",
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
        const functionResponseData = await ToolingService.executeTool(
          functionCall
        );
        historyManager.addToolResponse(functionCall.name, functionResponseData);
      } else {
        const finalResponsePart = responseCandidate.content.parts.find(
          (part: GeminiPart) => typeof part.text === "string"
        );

        if (finalResponsePart?.text) {
          return finalResponsePart.text;
        } else {
          console.error(
            "[LLMService.runLlmInteractionLoop] LLM response ended without text/call:",
            currentResponse.data
          );
          throw new Error("LLM did not provide a function call or final text.");
        }
      }
    }
  }

  public async getLlmMovieSuggestions(
    selectedMoods: string[],
    selectedGenreIds: number[]
  ): Promise<LlmResponse> {
    try {
      const tmdbService = TMDBService.getInstance();
      const availableGenres = await tmdbService.getGenres();

      const formattedPrompt = formatInitialPrompt(
        selectedMoods,
        selectedGenreIds,
        availableGenres
      );

      const historyManager = new History(formattedPrompt);

      const finalTextResponse = await this.runLlmInteractionLoop(
        historyManager,
        ToolingService.tools
      );

      const finalLlmOutput = parseFinalLlmResponse(finalTextResponse);
      return finalLlmOutput;
    } catch (error) {
      console.error("Error during LLM suggestion process:", error);
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
  }
}
