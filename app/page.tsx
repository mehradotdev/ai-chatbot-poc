"use client"

import type React from "react"

import { useSession, signOut } from "next-auth/react"
import { useChat } from "@ai-sdk/react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ConversationSidebar } from "@/components/conversation-sidebar"
import { ChatMessage } from "@/components/chat-message"
import { ModelSelector } from "@/components/model-selector"
import { Send, LogOut, Menu, X } from "lucide-react"
import type { Conversation, Message } from "@/lib/db"
import { AI_PROVIDERS } from "@/lib/ai-providers"
import { useRouter } from "next/navigation"

export default function ChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>()
  const [selectedProvider, setSelectedProvider] = useState("openai")
  const [selectedModel, setSelectedModel] = useState("gpt-4o")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Conversation title is captured once – just before we send the 1st message.
  const [draftTitle, setDraftTitle] = useState("")

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: "/api/chat",
    body: {
      conversationId: currentConversationId,
      modelProvider: selectedProvider,
      modelName: selectedModel,
      // use draftTitle; it’s "" on first render, updated right before send
      title: draftTitle || "New Chat",
    },
    onResponse: (response) => {
      const conversationId = response.headers.get("X-Conversation-Id")
      console.log("responsez", response)
      if (conversationId && !currentConversationId) {
        setCurrentConversationId(conversationId)
        loadConversations()
      }
    },
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      loadConversations()
    }
  }, [session])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const loadConversations = async () => {
    try {
      const response = await fetch("/api/conversations")
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      }
    } catch (error) {
      console.error("Failed to load conversations:", error)
    }
  }

  const loadConversationMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`)
      if (response.ok) {
        const messages: Message[] = await response.json()
        setMessages(
          messages.map((msg) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
          })),
        )
      }
    } catch (error) {
      console.error("Failed to load messages:", error)
    }
  }

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id)
    loadConversationMessages(id)

    // Update model selection based on conversation
    const conversation = conversations.find((c) => c.id === id)
    if (conversation) {
      setSelectedProvider(conversation.model_provider)
      setSelectedModel(conversation.model_name)
    }
  }

  const handleNewConversation = () => {
    setCurrentConversationId(undefined)
    setMessages([])
  }

  const handleDeleteConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations?id=${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setConversations(conversations.filter((c) => c.id !== id))
        if (currentConversationId === id) {
          handleNewConversation()
        }
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error)
    }
  }

  const handleRenameConversation = async (id: string, title: string) => {
    try {
      const response = await fetch("/api/conversations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title }),
      })
      if (response.ok) {
        setConversations(conversations.map((c) => (c.id === id ? { ...c, title } : c)))
      }
    } catch (error) {
      console.error("Failed to rename conversation:", error)
    }
  }

  const onSend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // capture the first 50 chars of whatever the user typed
    setDraftTitle(input.slice(0, 50).trim() || "New Chat")
    handleSubmit(e)
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="flex h-screen bg-white dark:bg-gray-950">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 transition-transform duration-200 ease-in-out fixed lg:relative z-40 h-full`}
      >
        <ConversationSidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
          onRenameConversation={handleRenameConversation}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ModelSelector
              selectedProvider={selectedProvider}
              selectedModel={selectedModel}
              onProviderChange={setSelectedProvider}
              onModelChange={setSelectedModel}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">{session.user?.name}</span>
            <Button variant="outline" size="sm" onClick={() => signOut()} className="gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1">
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center p-8">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Welcome to AI Chat</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Start a conversation with your selected AI model
                  </p>
                  <p className="text-sm text-gray-500">
                    Currently using: {AI_PROVIDERS.find((p) => p.id === selectedProvider)?.name} -{" "}
                    {
                      AI_PROVIDERS.find((p) => p.id === selectedProvider)?.models.find((m) => m.id === selectedModel)
                        ?.name
                    }
                  </p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={{
                      id: message.id,
                      conversation_id: currentConversationId || "",
                      role: message.role as "user" | "assistant" | "system",
                      content: message.content,
                      created_at: new Date(),
                    }}
                    userImage={session.user?.image || undefined}
                  />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={onSend} className="flex gap-2">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
