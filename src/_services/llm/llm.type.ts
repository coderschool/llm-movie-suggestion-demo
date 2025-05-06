export interface GeminiFunctionCall {
  name: string;
  args: unknown;
}
export interface GeminiFunctionResponse {
  name: string;
  response: {
    content: unknown;
  };
}
export interface GeminiPart {
  text?: string;
  functionCall?: GeminiFunctionCall;
  functionResponse?: GeminiFunctionResponse;
}

export const GeminiRole = {
  SYSTEM: "SYSTEM",
  USER: "USER",
  MODEL: "MODEL",
  TOOL: "TOOL",
} as const;

export interface GeminiContent {
  role: (typeof GeminiRole)[keyof typeof GeminiRole];
  parts: GeminiPart[];
}

export interface GeminiFunctionDeclaration {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<
      string,
      {
        type: string;
        description: string;
        items?: { type: string };
      }
    >;
    required?: string[];
  };
}

export interface GeminiToolSet {
  functionDeclarations: GeminiFunctionDeclaration[];
}

// Define ToolConfig and FunctionCallingConfig types based on Gemini API
export interface GeminiFunctionCallingConfig {
  mode?: "AUTO" | "ANY" | "NONE"; // Mode can be one of these
  allowedFunctionNames?: string[]; // Optional: specify which functions can be called
}

export interface GeminiToolConfig {
  functionCallingConfig?: GeminiFunctionCallingConfig;
}

export interface GeminiRequestBody {
  contents: GeminiContent[];
  tools?: GeminiToolSet[]; // Make tools optional
  toolConfig?: GeminiToolConfig; // Add optional toolConfig
}
