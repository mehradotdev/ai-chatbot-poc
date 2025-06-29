"use client"

import type { Message } from "@/lib/db"
import { MarkdownRenderer } from "./markdown-renderer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Bot } from "lucide-react"

interface ChatMessageProps {
  message: Message
  userImage?: string
}

export function ChatMessage({ message, userImage }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div className={`flex gap-3 p-4 ${isUser ? "bg-gray-50 dark:bg-gray-900" : ""}`}>
      <Avatar className="h-8 w-8 mt-1">
        {isUser ? (
          <>
            <AvatarImage src={userImage || "/placeholder.svg"} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </>
        ) : (
          <AvatarFallback className="bg-blue-600 text-white">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        )}
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium mb-1">{isUser ? "You" : "Assistant"}</div>
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <MarkdownRenderer content={message.content} />
        </div>
      </div>
    </div>
  )
}
