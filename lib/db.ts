import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

export const sql = neon(process.env.DATABASE_URL)

export interface User {
  id: string
  name?: string
  email: string
  image?: string
  created_at: Date
  updated_at: Date
}

export interface Conversation {
  id: string
  user_id: string
  title: string
  model_provider: string
  model_name: string
  created_at: Date
  updated_at: Date
}

export interface Message {
  id: string
  conversation_id: string
  role: "user" | "assistant" | "system"
  content: string
  created_at: Date
}

export async function createConversation(
  userId: string,
  title: string,
  modelProvider: string,
  modelName: string,
): Promise<Conversation> {
  const result = await sql`
    INSERT INTO conversations (user_id, title, model_provider, model_name)
    VALUES (${userId}, ${title}, ${modelProvider}, ${modelName})
    RETURNING *
  `
  return result[0] as Conversation
}

export async function getConversations(userId: string): Promise<Conversation[]> {
  const result = await sql`
    SELECT * FROM conversations 
    WHERE user_id = ${userId} 
    ORDER BY updated_at DESC
  `
  return result as Conversation[]
}

export async function getConversation(id: string, userId: string): Promise<Conversation | null> {
  const result = await sql`
    SELECT * FROM conversations 
    WHERE id = ${id} AND user_id = ${userId}
  `
  return (result[0] as Conversation) || null
}

export async function addMessage(
  conversationId: string,
  role: "user" | "assistant" | "system",
  content: string,
): Promise<Message> {
  const result = await sql`
    INSERT INTO messages (conversation_id, role, content)
    VALUES (${conversationId}, ${role}, ${content})
    RETURNING *
  `

  // Update conversation timestamp
  await sql`
    UPDATE conversations 
    SET updated_at = CURRENT_TIMESTAMP 
    WHERE id = ${conversationId}
  `

  return result[0] as Message
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const result = await sql`
    SELECT * FROM messages 
    WHERE conversation_id = ${conversationId} 
    ORDER BY created_at ASC
  `
  return result as Message[]
}

export async function updateConversationTitle(id: string, title: string): Promise<void> {
  await sql`
    UPDATE conversations 
    SET title = ${title}, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ${id}
  `
}

export async function deleteConversation(id: string, userId: string): Promise<void> {
  await sql`
    DELETE FROM conversations 
    WHERE id = ${id} AND user_id = ${userId}
  `
}
