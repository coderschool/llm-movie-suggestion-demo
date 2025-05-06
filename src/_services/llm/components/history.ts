import { GeminiContent, GeminiFunctionCall, GeminiRole } from "../llm.type";

/**
 * Manages the conversation history with the Gemini API.
 */
export class History {
  private history: GeminiContent[];

  constructor(initialPrompt: string) {
    this.history = [
      {
        role: GeminiRole.USER,
        parts: [{ text: initialPrompt }],
      },
    ];
  }

  /**
   * Adds the model's request to call a function to the history.
   * @param functionCall The function call object from the Gemini API response.
   */
  addModelFunctionCall(functionCall: GeminiFunctionCall): void {
    this.history.push({
      role: GeminiRole.MODEL,
      parts: [{ functionCall: functionCall }],
    });
  }

  /**
   * Adds the response from an executed tool to the history.
   * @param functionCallName The name of the function that was called.
   * @param responseData The data returned by the tool function.
   */
  addToolResponse(functionCallName: string, responseData: unknown): void {
    this.history.push({
      role: GeminiRole.TOOL,
      parts: [
        {
          functionResponse: {
            name: functionCallName,
            response: { content: responseData },
          },
        },
      ],
    });
  }

  /**
   * Returns a copy of the current conversation history.
   * @returns An array of GeminiContent objects representing the history.
   */
  getHistory(): GeminiContent[] {
    return [...this.history];
  }
}
