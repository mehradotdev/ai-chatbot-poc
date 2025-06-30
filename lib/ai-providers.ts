import { openai } from "@ai-sdk/openai"
import { anthropic } from "@ai-sdk/anthropic"
import { google } from "@ai-sdk/google"
import { xai } from "@ai-sdk/xai"

export interface ModelProvider {
  id: string
  name: string
  models: ModelConfig[]
}

export interface ModelConfig {
  id: string
  name: string
  description: string
}

export const AI_PROVIDERS: ModelProvider[] = [
  // {
  //   id: "openai",
  //   name: "OpenAI",
  //   models: [
  //     { id: "gpt-4o", name: "GPT-4o", description: "Most capable model" },
  //     { id: "gpt-4o-mini", name: "GPT-4o Mini", description: "Fast and efficient" },
  //     { id: "gpt-4-turbo", name: "GPT-4 Turbo", description: "Previous generation flagship" },
  //   ],
  // },
  // {
  //   id: "anthropic",
  //   name: "Anthropic",
  //   models: [
  //     { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", description: "Most intelligent model" },
  //     { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku", description: "Fast and lightweight" },
  //     { id: "claude-3-opus-20240229", name: "Claude 3 Opus", description: "Most powerful model" },
  //   ],
  // },
  {
    id: "google",
    name: "Google",
    models: [
      { id: "gemini-2.5-flash-lite-preview-06-17", name: "Gemini 2.5 Flash Lite Preview", description: "Fastest responses" },
      { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", description: "Fast responses" },
      { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", description: "Advanced reasoning" },
    ],
  },
  {
    id: "xai",
    name: "xAI",
    models: [
      { id: "grok-3-mini-latest", name: "Grok 3 Mini Latest", description: "Cheap and fast" },
      { id: "grok-beta", name: "Grok Beta", description: "Conversational AI" },
    ],
  },
]

export function getModelInstance(providerId: string, modelId: string) {
  switch (providerId) {
    case "openai":
      return openai(modelId)
    case "anthropic":
      return anthropic(modelId)
    case "google":
      return google(modelId)
    case "xai":
      return xai(modelId)
    default:
      throw new Error(`Unknown provider: ${providerId}`)
  }
}

export function getProviderName(providerId: string): string {
  const provider = AI_PROVIDERS.find((p) => p.id === providerId)
  return provider?.name || providerId
}

export function getModelName(providerId: string, modelId: string): string {
  const provider = AI_PROVIDERS.find((p) => p.id === providerId)
  const model = provider?.models.find((m) => m.id === modelId)
  return model?.name || modelId
}
