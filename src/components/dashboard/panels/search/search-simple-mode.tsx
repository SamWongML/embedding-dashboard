'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from '@/components/ui/form'
import { Loader2, Search } from 'lucide-react'
import { ActionWarningState } from '@/components/dashboard/panels/shared/action-warning-state'
import { toActionErrorMessage } from '@/lib/api'
import { useSearchMutation } from '@/lib/hooks/use-search'
import { cn } from '@/lib/utils'
import type { SearchResponse, SearchResult } from '@/lib/schemas/search'

const simpleSearchSchema = z.object({
  query: z.string().min(1, 'Query is required'),
})

type SimpleSearchValues = z.infer<typeof simpleSearchSchema>

interface SearchSimpleModeProps {
  className?: string
}

export function SearchSimpleMode({ className }: SearchSimpleModeProps) {
  const [result, setResult] = useState<SearchResponse | null>(null)
  const [actionWarning, setActionWarning] = useState<string | null>(null)
  const searchMutation = useSearchMutation()

  const form = useForm<SimpleSearchValues>({
    resolver: zodResolver(simpleSearchSchema),
    defaultValues: {
      query: '',
    },
  })

  const onSubmit = async (values: SimpleSearchValues) => {
    setActionWarning(null)

    try {
      const response = await searchMutation.mutateAsync({
        query: values.query,
      })
      setResult(response)
    } catch (error) {
      setActionWarning(
        toActionErrorMessage(error, 'Unable to run search query.')
      )
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="Search embeddings..."
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={searchMutation.isPending}>
                {searchMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      {actionWarning ? (
        <ActionWarningState
          title="Search request failed"
          description={actionWarning}
          onRetry={() => {
            void form.handleSubmit(onSubmit)()
          }}
        />
      ) : null}

      {result && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">
                Results ({result.totalCount})
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                {result.took.toFixed(0)}ms
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              {result.results.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm p-6">
                  No results found
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {result.results.map((item) => (
                    <SearchResultItem key={item.id} result={item} />
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function SearchResultItem({ result }: { result: SearchResult }) {
  return (
    <div className="px-4 py-3 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {(result.score * 100).toFixed(0)}%
          </Badge>
          {result.source && (
            <span className="text-xs text-muted-foreground">
              {result.source}
            </span>
          )}
        </div>
      </div>
      <p className="text-sm text-foreground line-clamp-3">{result.content}</p>
      {result.highlights && result.highlights.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {result.highlights.slice(0, 3).map((highlight, i) => (
            <span
              key={i}
              className="text-xs bg-accent px-1.5 py-0.5 rounded"
            >
              {highlight}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
