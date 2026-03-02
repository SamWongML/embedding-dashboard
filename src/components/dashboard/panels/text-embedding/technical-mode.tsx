'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from '@/components/ui/form'
import { Loader2, Send } from 'lucide-react'
import { ActionWarningState } from '@/components/dashboard/panels/shared/action-warning-state'
import { toActionErrorMessage } from '@/lib/api'
import {
  useTextEmbeddingModels,
  useCreateTextEmbeddingJob,
} from '@/lib/hooks/use-text-embedding'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import { EmbeddingSourceFields } from './embedding-source-fields'

const technicalFormSchema = z
  .object({
    sourceType: z.enum(['text', 'url']),
    text: z.string().optional(),
    url: z.string().optional(),
    model: z.string().optional(),
    dimensions: z.number().int().min(128).max(3072).optional(),
    chunkSize: z.number().int().min(100).max(4000),
    chunkOverlap: z.number().int().min(0).max(2000),
    batchSize: z.number().int().min(1).max(64),
    metadata: z.string().optional(),
    extractionMode: z.enum(['main-content', 'full-content']),
    maxChars: z.number().int().min(500).max(250_000),
  })
  .superRefine((values, context) => {
    if (values.chunkOverlap >= values.chunkSize) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['chunkOverlap'],
        message: 'Chunk overlap must be less than chunk size',
      })
    }

    if (values.sourceType === 'text') {
      if (!values.text || values.text.trim().length === 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['text'],
          message: 'Text is required',
        })
      }
      return
    }

    if (!values.url || values.url.trim().length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['url'],
        message: 'URL is required',
      })
      return
    }

    try {
      const url = new URL(values.url)
      if (url.protocol !== 'https:') {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['url'],
          message: 'URL must use HTTPS',
        })
      }
    } catch {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['url'],
        message: 'URL must be valid',
      })
    }
  })

type TechnicalFormValues = z.infer<typeof technicalFormSchema>

interface TechnicalModeProps {
  className?: string
  onJobCreated?: (id: string) => void
}

export function TechnicalMode({ className, onJobCreated }: TechnicalModeProps) {
  const [actionWarning, setActionWarning] = useState<string | null>(null)
  const { data: models } = useTextEmbeddingModels()
  const createEmbeddingJob = useCreateTextEmbeddingJob()

  const form = useForm<TechnicalFormValues>({
    resolver: zodResolver(technicalFormSchema),
    defaultValues: {
      sourceType: 'text',
      text: '',
      url: '',
      model: undefined,
      dimensions: undefined,
      chunkSize: 800,
      chunkOverlap: 80,
      batchSize: 8,
      metadata: '',
      extractionMode: 'main-content',
      maxChars: 20_000,
    },
  })

  const sourceType = useWatch({
    control: form.control,
    name: 'sourceType',
  }) ?? 'text'
  const sourceText = useWatch({
    control: form.control,
    name: 'text',
  }) ?? ''
  const sourceUrl = useWatch({
    control: form.control,
    name: 'url',
  }) ?? ''
  const selectedModelId = useWatch({
    control: form.control,
    name: 'model',
  })
  const selectedModel = useMemo(
    () => models?.find((model) => model.id === selectedModelId),
    [models, selectedModelId]
  )

  useEffect(() => {
    if (!models || models.length === 0) {
      return
    }

    if (!form.getValues('model')) {
      const firstModel = models[0]
      if (!firstModel) return
      form.setValue('model', firstModel.id)
      form.setValue('dimensions', firstModel.dimensions)
    }
  }, [form, models])

  useEffect(() => {
    if (!models || !selectedModelId) {
      return
    }

    const selectedModel = models.find((model) => model.id === selectedModelId)
    if (!selectedModel) {
      return
    }

    form.setValue('dimensions', selectedModel.dimensions)
  }, [form, models, selectedModelId])

  const onSubmit = async (values: TechnicalFormValues) => {
    setActionWarning(null)

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

      const source =
        values.sourceType === 'url'
          ? {
              type: 'url' as const,
              url: values.url?.trim() ?? '',
              extractionMode: values.extractionMode,
              maxChars: values.maxChars,
            }
          : {
              type: 'text' as const,
              text: values.text?.trim() ?? '',
            }

      const response = await createEmbeddingJob.mutateAsync({
        source,
        mode: 'technical',
        options: {
          model: values.model,
          dimensions: values.dimensions,
          chunkSize: values.chunkSize,
          chunkOverlap: values.chunkOverlap,
          batchSize: values.batchSize,
          metadata,
        },
      })
      onJobCreated?.(response.id)
    } catch (error) {
      setActionWarning(
        toActionErrorMessage(error, 'Unable to queue text embedding job.')
      )
    }
  }

  return (
    <div className={cn(className)}>
      <Card className="border-border/70">
        <CardHeader className="space-y-1">
          <CardTitle className="typography-size-base typography-weight-medium">
            Advanced Input
          </CardTitle>
          <p className="typography-size-sm text-muted-foreground">
            Tune model, chunking, extraction, and metadata options.
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <EmbeddingSourceFields
                sourceType={sourceType}
                onSourceTypeChange={(nextType) => {
                  form.setValue('sourceType', nextType, { shouldValidate: true })
                }}
                textValue={sourceText}
                onTextValueChange={(value) => {
                  form.setValue('text', value, { shouldValidate: true })
                }}
                urlValue={sourceUrl}
                onUrlValueChange={(value) => {
                  form.setValue('url', value, { shouldValidate: true })
                }}
                textError={form.formState.errors.text?.message}
                urlError={form.formState.errors.url?.message}
                disabled={createEmbeddingJob.isPending}
              />
              <input type="hidden" {...form.register('sourceType')} />
              <input type="hidden" {...form.register('text')} />
              <input type="hidden" {...form.register('url')} />

              <section className="space-y-4 rounded-xl border border-border/80 bg-muted/20 p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="typography-size-sm typography-weight-medium">
                    Advanced Parameters
                  </h3>
                  <Badge variant="blue-subtle">Engineer Mode</Badge>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
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

                  <FormField
                    control={form.control}
                    name="dimensions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dimensions</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={128}
                            max={3072}
                            value={field.value ?? ''}
                            onChange={(event) =>
                              field.onChange(
                                event.target.value === ''
                                  ? undefined
                                  : Number(event.target.value)
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="batchSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Batch Size</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={64}
                            value={field.value}
                            onChange={(event) =>
                              field.onChange(
                                event.target.value === ''
                                  ? 1
                                  : Number(event.target.value)
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {selectedModel ? (
                  <p className="typography-size-xs text-muted-foreground">
                    Active model: {selectedModel.name} ({selectedModel.dimensions}d)
                    {selectedModel.maxTokens
                      ? ` • up to ${selectedModel.maxTokens.toLocaleString()} tokens`
                      : ''}
                  </p>
                ) : null}

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="chunkSize"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <FormLabel>Chunk Size</FormLabel>
                          <span className="typography-size-xs text-muted-foreground">
                            {field.value}
                          </span>
                        </div>
                        <FormControl>
                          <Slider
                            min={100}
                            max={4000}
                            step={100}
                            value={[field.value]}
                            onValueChange={(value) => {
                              const nextValue = value[0]
                              if (typeof nextValue === 'number') {
                                field.onChange(nextValue)
                              }
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Controls how much text each embedding chunk contains.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="chunkOverlap"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <FormLabel>Chunk Overlap</FormLabel>
                          <span className="typography-size-xs text-muted-foreground">
                            {field.value}
                          </span>
                        </div>
                        <FormControl>
                          <Slider
                            min={0}
                            max={2000}
                            step={20}
                            value={[field.value]}
                            onValueChange={(value) => {
                              const nextValue = value[0]
                              if (typeof nextValue === 'number') {
                                field.onChange(nextValue)
                              }
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Adds shared context between neighboring chunks.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {sourceType === 'url' ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="extractionMode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Extraction Mode</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="main-content">Main content</SelectItem>
                              <SelectItem value="full-content">Full content</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="maxChars"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Characters</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={500}
                              max={250000}
                              value={field.value}
                              onChange={(event) =>
                                field.onChange(
                                  event.target.value === ''
                                    ? 500
                                    : Number(event.target.value)
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ) : null}

                <FormField
                  control={form.control}
                  name="metadata"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Metadata (JSON)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='{"source": "manual", "tags": ["demo"]}'
                          className="min-h-[88px] typography-family-mono typography-size-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Attach custom metadata for downstream filtering and tracing.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              <Button
                type="submit"
                disabled={createEmbeddingJob.isPending}
                className="h-10 w-full"
              >
                {createEmbeddingJob.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Queueing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Generate Embedding
                  </>
                )}
              </Button>
              {actionWarning ? (
                <ActionWarningState
                  title="Text embedding request failed"
                  description={actionWarning}
                  onRetry={() => {
                    void form.handleSubmit(onSubmit)()
                  }}
                />
              ) : null}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
