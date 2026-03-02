'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { Link2, Text } from 'lucide-react'

type EmbeddingInputSourceType = 'text' | 'url'

interface EmbeddingSourceFieldsProps {
  sourceType: EmbeddingInputSourceType
  onSourceTypeChange: (value: EmbeddingInputSourceType) => void
  textValue: string
  onTextValueChange: (value: string) => void
  urlValue: string
  onUrlValueChange: (value: string) => void
  textError?: string
  urlError?: string
  disabled?: boolean
  textPlaceholder?: string
  urlPlaceholder?: string
}

export function EmbeddingSourceFields({
  sourceType,
  onSourceTypeChange,
  textValue,
  onTextValueChange,
  urlValue,
  onUrlValueChange,
  textError,
  urlError,
  disabled = false,
  textPlaceholder = 'Paste or type your text content here...',
  urlPlaceholder = 'https://example.com/article',
}: EmbeddingSourceFieldsProps) {
  const activeError = sourceType === 'text' ? textError : urlError
  const textCharacterCount = textValue.length

  return (
    <div className="space-y-4">
      <div
        className="inline-flex w-full items-center rounded-lg border border-border bg-muted/35 p-1 sm:w-auto"
        role="tablist"
        aria-label="Embedding source type"
      >
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onSourceTypeChange('text')}
          role="tab"
          aria-selected={sourceType === 'text'}
          aria-pressed={sourceType === 'text'}
          aria-controls="text-embedding-source-text-panel"
          className={cn(
            'h-9 flex-1 gap-2 rounded-md px-3 sm:flex-none',
            sourceType === 'text'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground'
          )}
        >
          <Text className="h-3.5 w-3.5" />
          Direct Text
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onSourceTypeChange('url')}
          role="tab"
          aria-selected={sourceType === 'url'}
          aria-pressed={sourceType === 'url'}
          aria-controls="text-embedding-source-url-panel"
          className={cn(
            'h-9 flex-1 gap-2 rounded-md px-3 sm:flex-none',
            sourceType === 'url'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground'
          )}
        >
          <Link2 className="h-3.5 w-3.5" />
          URL Content
        </Button>
      </div>

      {sourceType === 'text' ? (
        <div
          id="text-embedding-source-text-panel"
          role="tabpanel"
          className="space-y-2"
        >
          <Label htmlFor="text-embedding-source-text">Text to embed</Label>
          <Textarea
            id="text-embedding-source-text"
            placeholder={textPlaceholder}
            className="min-h-[200px] resize-none rounded-lg"
            value={textValue}
            onChange={(event) => onTextValueChange(event.target.value)}
            disabled={disabled}
          />
          <div className="flex items-center justify-between gap-3 typography-size-xs text-muted-foreground">
            <span>Supports plain text and markdown snippets.</span>
            <span>{textCharacterCount.toLocaleString()} characters</span>
          </div>
        </div>
      ) : (
        <div
          id="text-embedding-source-url-panel"
          role="tabpanel"
          className="space-y-2"
        >
          <Label htmlFor="text-embedding-source-url">URL to embed</Label>
          <Input
            id="text-embedding-source-url"
            placeholder={urlPlaceholder}
            value={urlValue}
            onChange={(event) => onUrlValueChange(event.target.value)}
            disabled={disabled}
            type="url"
          />
          <p className="typography-size-xs text-muted-foreground">
            Content will be fetched and chunked automatically. HTTPS URLs only.
          </p>
        </div>
      )}

      {activeError ? (
        <p className="typography-size-xs text-destructive">{activeError}</p>
      ) : null}
    </div>
  )
}
