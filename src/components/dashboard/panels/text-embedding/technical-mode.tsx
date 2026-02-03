'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Loader2, Send, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'
import {
  useTextEmbeddingModels,
  useCreateTextEmbedding,
} from '@/lib/hooks/use-text-embedding'
import { cn } from '@/lib/utils'
import type { TextEmbeddingResponse } from '@/lib/schemas/text-embedding'

const technicalFormSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  model: z.string().optional(),
  chunkSize: z.number().min(100).max(2000),
  chunkOverlap: z.number().min(0).max(500),
  metadata: z.string().optional(),
  confluenceUrl: z.string().url().optional().or(z.literal('')),
})

type TechnicalFormValues = z.infer<typeof technicalFormSchema>

interface TechnicalModeProps {
  className?: string
}

export function TechnicalMode({ className }: TechnicalModeProps) {
  const [result, setResult] = useState<TextEmbeddingResponse | null>(null)
  const [copied, setCopied] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const { data: models } = useTextEmbeddingModels()
  const createEmbedding = useCreateTextEmbedding()

  const form = useForm<TechnicalFormValues>({
    resolver: zodResolver(technicalFormSchema),
    defaultValues: {
      text: '',
      model: undefined,
      chunkSize: 500,
      chunkOverlap: 50,
      metadata: '',
      confluenceUrl: '',
    },
  })

  const onSubmit = async (values: TechnicalFormValues) => {
    try {
      let metadata: Record<string, unknown> | undefined
      if (values.metadata) {
        try {
          metadata = JSON.parse(values.metadata)
        } catch {
          form.setError('metadata', { message: 'Invalid JSON' })
          return
        }
      }

      const response = await createEmbedding.mutateAsync({
        text: values.text,
        model: values.model,
        chunkSize: values.chunkSize,
        chunkOverlap: values.chunkOverlap,
        metadata,
        confluenceUrl: values.confluenceUrl || undefined,
      })
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
                        className="min-h-[120px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {models?.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name} ({model.dimensions}d)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="chunkSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chunk Size: {field.value}</FormLabel>
                      <FormControl>
                        <Slider
                          min={100}
                          max={2000}
                          step={100}
                          value={[field.value]}
                          onValueChange={(v) => field.onChange(v[0])}
                        />
                      </FormControl>
                      <FormDescription>100 - 2000 tokens</FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="chunkOverlap"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Overlap: {field.value}</FormLabel>
                      <FormControl>
                        <Slider
                          min={0}
                          max={500}
                          step={10}
                          value={[field.value]}
                          onValueChange={(v) => field.onChange(v[0])}
                        />
                      </FormControl>
                      <FormDescription>0 - 500 tokens</FormDescription>
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? (
                  <>
                    <ChevronUp className="mr-2 h-4 w-4" />
                    Hide Advanced
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-2 h-4 w-4" />
                    Show Advanced
                  </>
                )}
              </Button>

              {showAdvanced && (
                <div className="space-y-4 pt-2 border-t">
                  <FormField
                    control={form.control}
                    name="metadata"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Metadata (JSON)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='{"source": "manual", "tags": ["demo"]}'
                            className="min-h-[80px] font-mono text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confluenceUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confluence Page URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://your-domain.atlassian.net/wiki/..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Import content from Confluence
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

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
                  <p className="text-muted-foreground">Total Tokens</p>
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
                {result.results[0]?.totalChunks && (
                  <>
                    <div>
                      <p className="text-muted-foreground">Chunks</p>
                      <p className="font-medium">
                        {result.results[0].totalChunks}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Current Chunk</p>
                      <p className="font-medium">
                        {(result.results[0].chunkIndex || 0) + 1} /{' '}
                        {result.results[0].totalChunks}
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Vector Preview
                </p>
                <div className="bg-muted rounded-md p-3 font-mono text-xs overflow-x-auto max-h-[200px]">
                  [{result.results[0]?.vector.slice(0, 10).map(v => v.toFixed(6)).join(', ')}
                  , ... ({result.results[0]?.vector.length} dimensions)]
                </div>
              </div>
              {result.results[0]?.metadata && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Metadata</p>
                  <div className="bg-muted rounded-md p-3 font-mono text-xs overflow-x-auto">
                    {JSON.stringify(result.results[0].metadata, null, 2)}
                  </div>
                </div>
              )}
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
