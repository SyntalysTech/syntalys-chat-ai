export interface ModelConfig {
  id: string;
  name: string;
  description: string;
  descriptionKey: string;
  openaiModel: string;
  requiresAuth: boolean;
  badge?: string;
  systemPrompt?: string;
}

export const MODELS: ModelConfig[] = [
  {
    id: "synta-1.0",
    name: "SYNT A 1.0",
    description: "Modelo base rapido y eficiente",
    descriptionKey: "modelBaseDesc",
    openaiModel: "gpt-4o-mini",
    requiresAuth: false,
  },
  {
    id: "synta-1.0-reasoning",
    name: "SYNT A 1.0 Reasoning",
    description: "Razonamiento avanzado para tareas complejas",
    descriptionKey: "modelReasoningDesc",
    openaiModel: "gpt-4o",
    requiresAuth: true,
    badge: "Pro",
  },
  {
    id: "synta-1.5-beta",
    name: "SYNT A 1.5 Beta",
    description: "Ultimo modelo con capacidades ampliadas",
    descriptionKey: "modelBetaDesc",
    openaiModel: "gpt-4o",
    requiresAuth: true,
    badge: "Beta",
  },
];

export const DEFAULT_MODEL_ID = "synta-1.0";

export function getModelById(id: string): ModelConfig | undefined {
  return MODELS.find((m) => m.id === id);
}

export function getModelByIdOrDefault(id: string): ModelConfig {
  return getModelById(id) ?? MODELS[0];
}

export function getAvailableModels(isAuthenticated: boolean): ModelConfig[] {
  if (isAuthenticated) return MODELS;
  return MODELS.filter((m) => !m.requiresAuth);
}

export function getSystemPrompt(modelId: string): string {
  const model = getModelById(modelId);

  const base = `You are SYNTALYS AI, an advanced artificial intelligence assistant developed by SYNTALYS TECH. You are helpful, precise, and professional. You respond in the language of the user's last message. You provide clear, well-structured answers. You can use markdown formatting including code blocks, lists, tables, and headings. If you don't know something, you say so honestly. You never reveal internal technical details about your architecture or providers. When asked about your capabilities or models, you refer to SYNTALYS AI technology. You have vision capabilities: when a user shares an image, you can see and analyze it. Describe, comment on, or answer questions about images naturally.`;

  if (model?.id === "synta-1.0-reasoning") {
    return `${base}\n\nYou have enhanced reasoning capabilities. For every response, you MUST first show your step-by-step reasoning wrapped in <reasoning> tags, then provide your final answer outside those tags. The format MUST be:\n\n<reasoning>\nYour detailed step-by-step thinking process here...\n</reasoning>\n\nYour final polished answer here.\n\nAlways include the <reasoning> block, even for simple questions. The reasoning should be thorough and show your analytical process.`;
  }

  if (model?.id === "synta-1.5-beta") {
    return `${base}\n\nYou are the latest and most capable SYNTALYS AI model. You excel at creative tasks, complex analysis, coding, and nuanced conversations. Provide thorough, high-quality responses.`;
  }

  return base;
}
