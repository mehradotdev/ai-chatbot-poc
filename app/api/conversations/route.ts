import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getConversations, deleteConversation, updateConversationTitle } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 })
    }

    const conversations = await getConversations(session.user.id)
    return Response.json(conversations)
  } catch (error) {
    console.error("Get conversations error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get("id")

    if (!conversationId) {
      return new Response("Conversation ID required", { status: 400 })
    }

    await deleteConversation(conversationId, session.user.id)
    return new Response("OK")
  } catch (error) {
    console.error("Delete conversation error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { id, title } = await req.json()

    if (!id || !title) {
      return new Response("ID and title required", { status: 400 })
    }

    await updateConversationTitle(id, title)
    return new Response("OK")
  } catch (error) {
    console.error("Update conversation error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
