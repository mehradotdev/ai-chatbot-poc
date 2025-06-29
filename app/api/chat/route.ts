import { streamText } from "ai"
import { auth } from "@/lib/auth"
import { getModelInstance } from "@/lib/ai-providers"
import { addMessage, getConversation, createConversation } from "@/lib/db"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { messages, conversationId, modelProvider, modelName, title } = await req.json()

    let currentConversationId = conversationId

    // Create new conversation if none exists
    if (!currentConversationId) {
      const conversation = await createConversation(session.user.id, title || "New Chat", modelProvider, modelName)
      currentConversationId = conversation.id
    } else {
      // Verify user owns the conversation
      const conversation = await getConversation(currentConversationId, session.user.id)
      if (!conversation) {
        return new Response("Conversation not found", { status: 404 })
      }
    }

    // Save user message
    const userMessage = messages[messages.length - 1]
    await addMessage(currentConversationId, "user", userMessage.content)

    // Get AI model instance
    const model = getModelInstance(modelProvider, modelName)

    // Stream response from AI
    const result = streamText({
      model,
      messages,
      async onFinish({ text }) {
        // Save assistant message
        await addMessage(currentConversationId, "assistant", text)
      },
    })

    return result.toDataStreamResponse({
      headers: {
        "X-Conversation-Id": currentConversationId,
      },
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
