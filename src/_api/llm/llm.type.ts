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

export interface GeminiFunctionCallingConfig {
  mode?: "AUTO" | "ANY" | "NONE";
  allowedFunctionNames?: string[];
}

export interface GeminiToolConfig {
  functionCallingConfig?: GeminiFunctionCallingConfig;
}

export interface GeminiRequestBody {
  contents: GeminiContent[];
  tools?: GeminiToolSet[];
  toolConfig?: GeminiToolConfig;
}
