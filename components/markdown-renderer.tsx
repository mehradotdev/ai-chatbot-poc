"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Highlight, type Language } from "prism-react-renderer"
import { Copy, Check } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const copy = async (code: string) => {
    await navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "")
          const code = String(children).replace(/\n$/, "")

          /* ── Inline code ────────────────────────────── */
          if (inline || !match) {
            return (
              <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm" {...props}>
                {children}
              </code>
            )
          }

          /* ── Fenced code block ──────────────────────── */
          return (
            <div className="relative group my-4">
              {/* copy-button */}
              <Button
                size="sm"
                variant="ghost"
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => copy(code)}
              >
                {copied === code ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>

              <Highlight
                code={code}
                language={match[1] as Language}
                /* leave `theme` undefined → no extra file import */
              >
                {({ className, style, tokens, getLineProps, getTokenProps }) => (
                  <pre
                    className={`${className} rounded-md overflow-auto text-sm p-4 bg-gray-900 text-gray-100`}
                    style={style}
                  >
                    {tokens.map((line, i) => (
                      <div key={i} {...getLineProps({ line })}>
                        {line.map((token, key) => (
                          <span key={key} {...getTokenProps({ token })} />
                        ))}
                      </div>
                    ))}
                  </pre>
                )}
              </Highlight>
            </div>
          )
        },

        /* ---- basic markdown element tweaks (unchanged) ---- */
        table({ children }) {
          return (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
                {children}
              </table>
            </div>
          )
        },
        th({ children }) {
          return (
            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 bg-gray-100 dark:bg-gray-800 font-semibold text-left">
              {children}
            </th>
          )
        },
        td({ children }) {
          return <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{children}</td>
        },
        blockquote({ children }) {
          return (
            <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-4">
              {children}
            </blockquote>
          )
        },
        ul({ children }) {
          return <ul className="list-disc list-inside my-4 space-y-1">{children}</ul>
        },
        ol({ children }) {
          return <ol className="list-decimal list-inside my-4 space-y-1">{children}</ol>
        },
        h1({ children }) {
          return <h1 className="text-2xl font-bold my-4">{children}</h1>
        },
        h2({ children }) {
          return <h2 className="text-xl font-bold my-3">{children}</h2>
        },
        h3({ children }) {
          return <h3 className="text-lg font-bold my-2">{children}</h3>
        },
        p({ children }) {
          return <p className="my-2 leading-relaxed">{children}</p>
        },
        a({ href, children }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {children}
            </a>
          )
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
