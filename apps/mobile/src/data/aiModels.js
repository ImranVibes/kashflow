export const AI_PROVIDERS = [
  {
    id: "gemini",
    name: "Google Gemini",
    icon: "✦",
    color: "#4285F4",
    gradient: ["#4285F4", "#0F52BA"],
    keyPlaceholder: "AIzaSy...",
    keyLabel: "Gemini API Key",
    keyHint: "Get your key at aistudio.google.com",
    models: [
      {
        id: "gemini-2.5-flash",
        name: "Gemini 2.5 Flash",
        badge: "Fast",
        badgeColor: "#4285F4",
      },
      {
        id: "gemini-2.5-pro",
        name: "Gemini 2.5 Pro",
        badge: "Smart",
        badgeColor: "#0F52BA",
      },
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", badge: null },
      { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", badge: null },
      { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", badge: null },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    icon: "⬡",
    color: "#10A37F",
    gradient: ["#10A37F", "#0D8C6C"],
    keyPlaceholder: "sk-...",
    keyLabel: "OpenAI API Key",
    keyHint: "Get your key at platform.openai.com",
    models: [
      { id: "gpt-4o", name: "GPT-4o", badge: "Best", badgeColor: "#10A37F" },
      {
        id: "gpt-4o-mini",
        name: "GPT-4o Mini",
        badge: "Fast",
        badgeColor: "#10A37F",
      },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo", badge: null },
      {
        id: "gpt-3.5-turbo",
        name: "GPT-3.5 Turbo",
        badge: "Cheap",
        badgeColor: "#6B7280",
      },
      {
        id: "o1-mini",
        name: "o1 Mini",
        badge: "Reasoning",
        badgeColor: "#8B5CF6",
      },
    ],
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    icon: "⬡",
    color: "#6366F1",
    gradient: ["#6366F1", "#4F46E5"],
    keyPlaceholder: "sk-or-...",
    keyLabel: "OpenRouter API Key",
    keyHint: "Get your key at openrouter.ai — access 300+ models",
    models: [
      {
        id: "openrouter/owl-alpha",
        name: "OWL Alpha",
        badge: null,
        badgeColor: null,
      },
      {
        id: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
        name: "Nemotron Nano 30B Reasoning",
        badge: "Free",
        badgeColor: "#059669",
      },
      {
        id: "poolside/laguna-xs.2:free",
        name: "Laguna XS.2",
        badge: "Free",
        badgeColor: "#059669",
      },
      {
        id: "deepseek/deepseek-v4-flash",
        name: "DeepSeek V4 Flash",
        badge: "Cheap",
        badgeColor: "#6B7280",
      },
      {
        id: "deepseek/deepseek-v4-flash:free",
        name: "DeepSeek V4 Flash",
        badge: "Free",
        badgeColor: "#059669",
      },
      {
        id: "inclusionai/ling-2.6-1t",
        name: "Ling 2.6 1T",
        badge: "Cheap",
        badgeColor: "#6B7280",
      },
      {
        id: "inclusionai/ling-2.6-flash",
        name: "Ling 2.6 Flash",
        badge: "Cheap",
        badgeColor: "#6B7280",
      },
      {
        id: "xiaomi/mimo-v2.5",
        name: "MiMo V2.5",
        badge: "Cheap",
        badgeColor: "#6B7280",
      },
      {
        id: "google/gemma-4-26b-a4b-it",
        name: "Gemma 4 26B",
        badge: "Cheap",
        badgeColor: "#6B7280",
      },
      {
        id: "google/gemma-4-31b-it",
        name: "Gemma 4 31B",
        badge: "Cheap",
        badgeColor: "#6B7280",
      },
      {
        id: "minimax/minimax-m2.5:free",
        name: "MiniMax M2.5",
        badge: "Free",
        badgeColor: "#059669",
      },
      {
        id: "nousresearch/hermes-3-llama-3.1-405b:free",
        name: "Hermes 3 Llama 405B",
        badge: "Free",
        badgeColor: "#059669",
      },
      {
        id: "meta-llama/llama-3.2-3b-instruct:free",
        name: "Llama 3.2 3B",
        badge: "Free",
        badgeColor: "#059669",
      },
      {
        id: "meta-llama/llama-3.3-70b-instruct:free",
        name: "Llama 3.3 70B",
        badge: "Free",
        badgeColor: "#059669",
      },
      {
        id: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
        name: "Dolphin Mistral 24B",
        badge: "Free",
        badgeColor: "#059669",
      },
      {
        id: "qwen/qwen3-coder:free",
        name: "Qwen3 Coder",
        badge: "Free",
        badgeColor: "#059669",
      },
      {
        id: "z-ai/glm-4.5-air:free",
        name: "GLM 4.5 Air",
        badge: "Free",
        badgeColor: "#059669",
      },
      {
        id: "openai/gpt-oss-120b:free",
        name: "GPT OSS 120B",
        badge: "Free",
        badgeColor: "#059669",
      },
      {
        id: "nvidia/nemotron-nano-9b-v2:free",
        name: "Nemotron Nano 9B V2",
        badge: "Free",
        badgeColor: "#059669",
      },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    icon: "◈",
    color: "#D97706",
    gradient: ["#D97706", "#B45309"],
    keyPlaceholder: "sk-ant-...",
    keyLabel: "Anthropic API Key",
    keyHint: "Get your key at console.anthropic.com",
    models: [
      {
        id: "claude-sonnet-4-5",
        name: "Claude Sonnet 4.5",
        badge: "Latest",
        badgeColor: "#D97706",
      },
      {
        id: "claude-opus-4",
        name: "Claude Opus 4",
        badge: "Best",
        badgeColor: "#B45309",
      },
      {
        id: "claude-haiku-3-5",
        name: "Claude Haiku 3.5",
        badge: "Fast",
        badgeColor: "#D97706",
      },
      {
        id: "claude-3-5-sonnet-20241022",
        name: "Claude 3.5 Sonnet",
        badge: null,
      },
    ],
  },
  {
    id: "mistral",
    name: "Mistral AI",
    icon: "◎",
    color: "#FF7000",
    gradient: ["#FF7000", "#CC5500"],
    keyPlaceholder: "your-mistral-key...",
    keyLabel: "Mistral API Key",
    keyHint: "Get your key at console.mistral.ai",
    models: [
      {
        id: "mistral-large-latest",
        name: "Mistral Large",
        badge: "Best",
        badgeColor: "#FF7000",
      },
      {
        id: "mistral-small-latest",
        name: "Mistral Small",
        badge: "Fast",
        badgeColor: "#FF7000",
      },
      { id: "open-mixtral-8x22b", name: "Mixtral 8x22B", badge: null },
      {
        id: "open-mistral-nemo",
        name: "Mistral Nemo",
        badge: "Cheap",
        badgeColor: "#6B7280",
      },
      { id: "codestral-latest", name: "Codestral", badge: null },
    ],
  },
];

export function getProviderById(id) {
  return AI_PROVIDERS.find((p) => p.id === id);
}

export function getModelById(providerId, modelId) {
  const provider = getProviderById(providerId);
  if (!provider) return null;
  return provider.models.find((m) => m.id === modelId);
}
