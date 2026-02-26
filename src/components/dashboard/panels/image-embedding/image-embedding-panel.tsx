'use client'

import Image from 'next/image'
import { useState, useCallback } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button, IconButton } from '@/components/ui/button'
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
import { Loader2, Send, Copy, Check, Upload, Image as ImageIcon, X } from 'lucide-react'
import { ActionWarningState } from '@/components/dashboard/panels/shared/action-warning-state'
import { toActionErrorMessage } from '@/lib/api'
import { useServiceMode } from '@/components/providers/service-mode-provider'
import {
  useImageEmbeddingModels,
  useCreateImageEmbedding,
} from '@/lib/hooks/use-image-embedding'
import { cn } from '@/lib/utils'
import type { ImageEmbeddingResponse } from '@/lib/schemas/image-embedding'

// URL validation for image sources
// Only allow HTTPS URLs and blob URLs (for uploaded files)
// This prevents SSRF attacks via unoptimized Next.js Image component
function isValidImageUrl(url: string): boolean {
  if (!url) return false

  try {
    const parsed = new URL(url)
    // Allow blob URLs for local file uploads
    if (parsed.protocol === 'blob:') return true
    // Only allow HTTPS for external URLs
    if (parsed.protocol !== 'https:') return false

    // Optional: Add domain allowlist if NEXT_PUBLIC_SUPABASE_URL is set
    // This would restrict to trusted domains only
    return true
  } catch {
    return false
  }
}

const imageFormSchema = z.object({
  url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  model: z.string().optional(),
  resolution: z.number().min(64).max(1024),
})

type ImageFormValues = z.infer<typeof imageFormSchema>

interface ImageEmbeddingPanelProps {
  className?: string
}

export function ImageEmbeddingPanel({ className }: ImageEmbeddingPanelProps) {
  const { serviceMode } = useServiceMode()
  const [result, setResult] = useState<ImageEmbeddingResponse | null>(null)
  const [actionWarning, setActionWarning] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imagePreviewError, setImagePreviewError] = useState(false)

  const { data: models } = useImageEmbeddingModels()
  const createEmbedding = useCreateImageEmbedding()

  const form = useForm<ImageFormValues>({
    resolver: zodResolver(imageFormSchema),
    defaultValues: {
      url: '',
      model: undefined,
      resolution: 224,
    },
  })

  const watchedUrl = useWatch({
    control: form.control,
    name: 'url',
  })

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setImagePreviewError(false)
      form.setValue('url', '')
    }
  }, [form])

  const clearFile = useCallback(() => {
    setUploadedFile(null)
    setImagePreviewError(false)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }, [previewUrl])

  const onSubmit = async (values: ImageFormValues) => {
    setActionWarning(null)

    try {
      const response = await createEmbedding.mutateAsync({
        url: values.url || undefined,
        file: uploadedFile || undefined,
        model: values.model,
        resolution: values.resolution,
      })
      setResult(response)
    } catch (error) {
      setActionWarning(
        toActionErrorMessage(error, 'Unable to create image embedding.')
      )
    }
  }

  const handleCopy = async () => {
    if (result?.result?.vector) {
      await navigator.clipboard.writeText(JSON.stringify(result.result.vector))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="typography-size-base typography-weight-medium">Input</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Image Source */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://example.com/image.jpg"
                              {...field}
                              onChange={(event) => {
                                setImagePreviewError(false)
                                field.onChange(event)
                              }}
                              disabled={!!uploadedFile}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="text-center typography-size-sm text-muted-foreground">
                      or
                    </div>

                    <div>
                      <FormLabel>Upload Image</FormLabel>
                      {uploadedFile ? (
                        <div className="mt-2 relative">
                          <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                            <ImageIcon className="h-4 w-4" />
                            <span className="typography-size-sm flex-1 truncate">
                              {uploadedFile.name}
                            </span>
                            <IconButton
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label="Remove uploaded image"
                              className="h-6 w-6"
                              onClick={clearFile}
                            >
                              <X className="h-4 w-4" />
                            </IconButton>
                          </div>
                        </div>
                      ) : (
                        <label className="mt-2 flex items-center justify-center w-full h-24 border-2 border-dashed border-muted-foreground/25 rounded-md cursor-pointer hover:border-muted-foreground/50 transition-colors">
                          <div className="flex flex-col items-center gap-1">
                            <Upload className="h-6 w-6 text-muted-foreground" />
                            <span className="typography-size-xs text-muted-foreground">
                              Click to upload
                            </span>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                            disabled={!!watchedUrl}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Preview */}
                  {(previewUrl || watchedUrl) && !imagePreviewError && (
                    <div className="mt-4">
                      <FormLabel>Preview</FormLabel>
                      <div className="mt-2 relative aspect-video bg-muted rounded-md overflow-hidden">
                        {isValidImageUrl(previewUrl || watchedUrl || '') ? (
                          <Image
                            src={previewUrl || watchedUrl || ''}
                            alt="Preview"
                            fill
                            className="object-contain"
                            onError={() => {
                              setImagePreviewError(true)
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground typography-size-sm">
                            Invalid image URL. Only HTTPS URLs are allowed.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Technical Options */}
                  {serviceMode === 'technical' && (
                    <>
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

                      <FormField
                        control={form.control}
                        name="resolution"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Resolution: {field.value}px</FormLabel>
                            <FormControl>
                              <Slider
                                min={64}
                                max={1024}
                                step={32}
                                value={[field.value]}
                                onValueChange={(v) => field.onChange(v[0])}
                              />
                            </FormControl>
                            <FormDescription>
                              Higher resolution = more detail, slower processing
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  <Button
                    type="submit"
                    disabled={createEmbedding.isPending || (!watchedUrl && !uploadedFile)}
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
                  {actionWarning ? (
                    <ActionWarningState
                      title="Image embedding request failed"
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="typography-size-base typography-weight-medium">Result</CardTitle>
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
                <div className="grid grid-cols-2 gap-4 typography-size-sm">
                  <div>
                    <p className="text-muted-foreground">Model</p>
                    <p className="typography-weight-medium">{result.result.model}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Resolution</p>
                    <p className="typography-weight-medium">{result.result.resolution}px</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Dimensions</p>
                    <p className="typography-weight-medium">{result.result.vector.length}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Processing Time</p>
                    <p className="typography-weight-medium">
                      {result.processingTime.toFixed(0)}ms
                    </p>
                  </div>
                </div>
                <div>
                  <p className="typography-size-sm text-muted-foreground mb-2">
                    Vector Preview
                  </p>
                  <div className="bg-muted rounded-md p-3 typography-family-mono typography-size-xs overflow-x-auto">
                    [{result.result.vector.slice(0, 8).map(v => v.toFixed(6)).join(', ')}
                    , ...]
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground typography-size-sm">
                Results will appear here
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
