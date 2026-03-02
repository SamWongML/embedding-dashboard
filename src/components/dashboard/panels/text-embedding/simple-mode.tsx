'use client'

import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { Loader2, Send } from 'lucide-react'
import { ActionWarningState } from '@/components/dashboard/panels/shared/action-warning-state'
import { toActionErrorMessage } from '@/lib/api'
import { useCreateTextEmbeddingJob } from '@/lib/hooks/use-text-embedding'
import { cn } from '@/lib/utils'
import { EmbeddingSourceFields } from './embedding-source-fields'

const simpleFormSchema = z
  .object({
    sourceType: z.enum(['text', 'url']),
    text: z.string().optional(),
    url: z.string().optional(),
  })
  .superRefine((values, context) => {
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

type SimpleFormValues = z.infer<typeof simpleFormSchema>

interface SimpleModeProps {
  className?: string
  onJobCreated?: (id: string) => void
}

export function SimpleMode({ className, onJobCreated }: SimpleModeProps) {
  const [actionWarning, setActionWarning] = useState<string | null>(null)
  const createEmbeddingJob = useCreateTextEmbeddingJob()

  const form = useForm<SimpleFormValues>({
    resolver: zodResolver(simpleFormSchema),
    defaultValues: {
      sourceType: 'text',
      text: '',
      url: '',
    },
  })

  const onSubmit = async (values: SimpleFormValues) => {
    setActionWarning(null)

    try {
      const source =
        values.sourceType === 'url'
          ? {
              type: 'url' as const,
              url: values.url?.trim() ?? '',
            }
          : {
              type: 'text' as const,
              text: values.text?.trim() ?? '',
            }

      const response = await createEmbeddingJob.mutateAsync({
        source,
        mode: 'simple',
      })
      onJobCreated?.(response.id)
    } catch (error) {
      setActionWarning(
        toActionErrorMessage(error, 'Unable to queue text embedding job.')
      )
    }
  }

  const sourceType = useWatch({
    control: form.control,
    name: 'sourceType',
  }) ?? 'text'
  const text = useWatch({
    control: form.control,
    name: 'text',
  }) ?? ''
  const url = useWatch({
    control: form.control,
    name: 'url',
  }) ?? ''

  return (
    <div className={cn(className)}>
      <Card className="border-border/70">
        <CardHeader className="space-y-1">
          <CardTitle className="typography-size-base typography-weight-medium">
            Direct Input
          </CardTitle>
          <p className="typography-size-sm text-muted-foreground">
            Generate vector embeddings from text content or web URLs.
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <EmbeddingSourceFields
                sourceType={sourceType}
                onSourceTypeChange={(nextType) => {
                  form.setValue('sourceType', nextType, { shouldValidate: true })
                }}
                textValue={text}
                onTextValueChange={(value) => {
                  form.setValue('text', value, { shouldValidate: true })
                }}
                urlValue={url}
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
