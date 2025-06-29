"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Plus, Trash2, Edit2, MoreHorizontal } from "lucide-react"
import type { Conversation } from "@/lib/db"
import { getProviderName, getModelName } from "@/lib/ai-providers"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

interface ConversationSidebarProps {
  conversations: Conversation[]
  currentConversationId?: string
  onSelectConversation: (id: string) => void
  onNewConversation: () => void
  onDeleteConversation: (id: string) => void
  onRenameConversation: (id: string, title: string) => void
}

export function ConversationSidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
}: ConversationSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")

  const handleStartEdit = (conversation: Conversation) => {
    setEditingId(conversation.id)
    setEditTitle(conversation.title)
  }

  const handleSaveEdit = () => {
    if (editingId && editTitle.trim()) {
      onRenameConversation(editingId, editTitle.trim())
    }
    setEditingId(null)
    setEditTitle("")
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditTitle("")
  }

  return (
    <div className="w-64 border-r bg-gray-50 dark:bg-gray-900 flex flex-col">
      <div className="p-4 border-b">
        <Button onClick={onNewConversation} className="w-full gap-2">
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`group relative rounded-lg p-3 cursor-pointer transition-colors ${
                currentConversationId === conversation.id
                  ? "bg-blue-100 dark:bg-blue-900"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="h-4 w-4 text-gray-500" />
                    {editingId === conversation.id ? (
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={handleSaveEdit}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit()
                          if (e.key === "Escape") handleCancelEdit()
                        }}
                        className="h-6 text-sm"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="text-sm font-medium truncate">{conversation.title}</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {getProviderName(conversation.model_provider)} -{" "}
                    {getModelName(conversation.model_provider, conversation.model_name)}
                  </div>
                  <div className="text-xs text-gray-400">{new Date(conversation.updated_at).toLocaleDateString()}</div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleStartEdit(conversation)}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDeleteConversation(conversation.id)} className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
