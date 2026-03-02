'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  SelectorTabs,
  SelectorTabsList,
  SelectorTabsTrigger,
} from '@/components/ui/selector-tabs'
import { Textarea } from '@/components/ui/textarea'

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
      <SelectorTabs
        value={sourceType}
        onValueChange={(value) => {
          if (value === 'text' || value === 'url') {
            onSourceTypeChange(value)
          }
        }}
        aria-label="Embedding source type"
      >
        <SelectorTabsList aria-label="Embedding source type">
          <SelectorTabsTrigger
            value="text"
            disabled={disabled}
            aria-controls="text-embedding-source-text-panel"
          >
            Direct Text
          </SelectorTabsTrigger>
          <SelectorTabsTrigger
            value="url"
            disabled={disabled}
            aria-controls="text-embedding-source-url-panel"
          >
            URL Content
          </SelectorTabsTrigger>
        </SelectorTabsList>
      </SelectorTabs>

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
