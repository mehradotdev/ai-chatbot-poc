import { auth } from "@/lib/auth"
import { getMessages, getConversation } from "@/lib/db"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 })
    }

    const conversationId = params.id

    // Verify user owns the conversation
    const conversation = await getConversation(conversationId, session.user.id)
    if (!conversation) {
      return new Response("Conversation not found", { status: 404 })
    }

    const messages = await getMessages(conversationId)
    return Response.json(messages)
  } catch (error) {
    console.error("Get messages error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
