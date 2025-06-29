"use client"

import { signIn, getProviders } from "next-auth/react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, Chrome } from "lucide-react"

export default function SignIn() {
  const [providers, setProviders] = useState<any>(null)

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await getProviders()
      setProviders(res)
    }
    fetchProviders()
  }, [])

  const getProviderIcon = (providerId: string) => {
    switch (providerId) {
      case "github":
        return <Github className="h-5 w-5" />
      case "google":
        return <Chrome className="h-5 w-5" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to AI Chat</CardTitle>
          <CardDescription>Sign in to start chatting with multiple AI models</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {providers &&
            Object.values(providers).map((provider: any) => (
              <Button
                key={provider.name}
                variant="outline"
                className="w-full gap-2 bg-transparent"
                onClick={() => signIn(provider.id, { callbackUrl: "/" })}
              >
                {getProviderIcon(provider.id)}
                Sign in with {provider.name}
              </Button>
            ))}
        </CardContent>
      </Card>
    </div>
  )
}
