"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AI_PROVIDERS } from "@/lib/ai-providers"
import { Settings } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface ModelSelectorProps {
  selectedProvider: string
  selectedModel: string
  onProviderChange: (provider: string) => void
  onModelChange: (model: string) => void
}

export function ModelSelector({
  selectedProvider,
  selectedModel,
  onProviderChange,
  onModelChange,
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false)

  const currentProvider = AI_PROVIDERS.find((p) => p.id === selectedProvider)
  const currentModel = currentProvider?.models.find((m) => m.id === selectedModel)

  const handleProviderChange = (providerId: string) => {
    onProviderChange(providerId)
    const provider = AI_PROVIDERS.find((p) => p.id === providerId)
    if (provider && provider.models.length > 0) {
      onModelChange(provider.models[0].id)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Settings className="h-4 w-4" />
          {currentProvider?.name} - {currentModel?.name}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select AI Model</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Provider</label>
            <Select value={selectedProvider} onValueChange={handleProviderChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AI_PROVIDERS.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {currentProvider && (
            <div>
              <label className="text-sm font-medium mb-2 block">Model</label>
              <Select value={selectedModel} onValueChange={onModelChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currentProvider.models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div>
                        <div className="font-medium">{model.name}</div>
                        <div className="text-sm text-gray-500">{model.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button onClick={() => setOpen(false)} className="w-full">
            Apply Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
