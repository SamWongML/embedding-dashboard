'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Loader2, Send, Copy, Check } from 'lucide-react'
import { useCreateTextEmbedding } from '@/lib/hooks/use-text-embedding'
import { cn } from '@/lib/utils'
import type { TextEmbeddingResponse } from '@/lib/schemas/text-embedding'

const simpleFormSchema = z.object({
  text: z.string().min(1, 'Text is required'),
})

type SimpleFormValues = z.infer<typeof simpleFormSchema>

interface SimpleModeProps {
  className?: string
}

export function SimpleMode({ className }: SimpleModeProps) {
  const [result, setResult] = useState<TextEmbeddingResponse | null>(null)
  const [copied, setCopied] = useState(false)
  const createEmbedding = useCreateTextEmbedding()

  const form = useForm<SimpleFormValues>({
    resolver: zodResolver(simpleFormSchema),
    defaultValues: {
      text: '',
    },
  })

  const onSubmit = async (values: SimpleFormValues) => {
    try {
      const response = await createEmbedding.mutateAsync(values)
      setResult(response)
    } catch (error) {
      console.error('Failed to create embedding:', error)
    }
  }

  const handleCopy = async () => {
    if (result?.results[0]?.vector) {
      await navigator.clipboard.writeText(
        JSON.stringify(result.results[0].vector)
      )
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className={cn('grid gap-6 lg:grid-cols-2', className)}>
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Input</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text to embed</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter text to create an embedding..."
                        className="min-h-[200px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={createEmbedding.isPending}
                className="w-full"
              >
                {createEmbedding.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Create Embedding
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium">Result</CardTitle>
          {result && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8"
            >
              {copied ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Model</p>
                  <p className="font-medium">{result.results[0]?.model}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tokens</p>
                  <p className="font-medium">{result.totalTokens}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Dimensions</p>
                  <p className="font-medium">
                    {result.results[0]?.vector.length}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Processing Time</p>
                  <p className="font-medium">
                    {result.processingTime.toFixed(0)}ms
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Vector Preview
                </p>
                <div className="bg-muted rounded-md p-3 font-mono text-xs overflow-x-auto">
                  [{result.results[0]?.vector.slice(0, 5).map(v => v.toFixed(6)).join(', ')}
                  , ...]
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
              Results will appear here
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
