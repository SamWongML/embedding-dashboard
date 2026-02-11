'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button, IconButton } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Loader2, Search, X, Plus } from 'lucide-react'
import { ActionWarningState } from '@/components/dashboard/panels/shared/action-warning-state'
import { toActionErrorMessage } from '@/lib/api'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSearchMutation } from '@/lib/hooks/use-search'
import { cn } from '@/lib/utils'
import type { SearchResponse, SearchResult, SearchFilter } from '@/lib/schemas/search'

const technicalSearchSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  vectorWeight: z.number().min(0).max(1),
  bm25Weight: z.number().min(0).max(1),
  graphWeight: z.number().min(0).max(1),
  limit: z.number().min(1).max(100),
})

type TechnicalSearchValues = z.infer<typeof technicalSearchSchema>

interface SearchTechnicalModeProps {
  className?: string
}

export function SearchTechnicalMode({ className }: SearchTechnicalModeProps) {
  const [result, setResult] = useState<SearchResponse | null>(null)
  const [actionWarning, setActionWarning] = useState<string | null>(null)
  const [filters, setFilters] = useState<SearchFilter[]>([])
  const searchMutation = useSearchMutation()

  const form = useForm<TechnicalSearchValues>({
    resolver: zodResolver(technicalSearchSchema),
    defaultValues: {
      query: '',
      vectorWeight: 0.5,
      bm25Weight: 0.3,
      graphWeight: 0.2,
      limit: 20,
    },
  })

  const onSubmit = async (values: TechnicalSearchValues) => {
    setActionWarning(null)

    try {
      const response = await searchMutation.mutateAsync({
        query: values.query,
        vectorWeight: values.vectorWeight,
        bm25Weight: values.bm25Weight,
        graphWeight: values.graphWeight,
        filters: filters.length > 0 ? filters : undefined,
        limit: values.limit,
      })
      setResult(response)
    } catch (error) {
      setActionWarning(
        toActionErrorMessage(error, 'Unable to run search query.')
      )
    }
  }

  const addFilter = () => {
    setFilters([...filters, { field: '', operator: 'eq', value: '' }])
  }

  const updateFilter = (index: number, filter: Partial<SearchFilter>) => {
    const newFilters = [...filters]
    newFilters[index] = { ...newFilters[index], ...filter }
    setFilters(newFilters)
  }

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index))
  }

  return (
    <div className={cn('grid gap-6 lg:grid-cols-3', className)}>
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-base font-medium">Search Options</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Query</FormLabel>
                    <FormControl>
                      <Input placeholder="Search embeddings..." {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Weight Distribution</h4>

                <FormField
                  control={form.control}
                  name="vectorWeight"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between">
                        <FormLabel>Vector</FormLabel>
                        <span className="text-xs text-muted-foreground">
                          {(field.value * 100).toFixed(0)}%
                        </span>
                      </div>
                      <FormControl>
                        <Slider
                          min={0}
                          max={1}
                          step={0.05}
                          value={[field.value]}
                          onValueChange={(v) => field.onChange(v[0])}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bm25Weight"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between">
                        <FormLabel>BM25</FormLabel>
                        <span className="text-xs text-muted-foreground">
                          {(field.value * 100).toFixed(0)}%
                        </span>
                      </div>
                      <FormControl>
                        <Slider
                          min={0}
                          max={1}
                          step={0.05}
                          value={[field.value]}
                          onValueChange={(v) => field.onChange(v[0])}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="graphWeight"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between">
                        <FormLabel>Graph</FormLabel>
                        <span className="text-xs text-muted-foreground">
                          {(field.value * 100).toFixed(0)}%
                        </span>
                      </div>
                      <FormControl>
                        <Slider
                          min={0}
                          max={1}
                          step={0.05}
                          value={[field.value]}
                          onValueChange={(v) => field.onChange(v[0])}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Filters</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addFilter}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>

                {filters.map((filter, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder="field"
                      value={filter.field}
                      onChange={(e) =>
                        updateFilter(index, { field: e.target.value })
                      }
                      className="flex-1"
                    />
                    <Select
                      value={filter.operator}
                      onValueChange={(v) =>
                        updateFilter(index, { operator: v as SearchFilter['operator'] })
                      }
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eq">=</SelectItem>
                        <SelectItem value="ne">!=</SelectItem>
                        <SelectItem value="contains">~</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="value"
                      value={String(filter.value)}
                      onChange={(e) =>
                        updateFilter(index, { value: e.target.value })
                      }
                      className="flex-1"
                    />
                    <IconButton
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Remove filter"
                      onClick={() => removeFilter(index)}
                    >
                      <X className="h-4 w-4" />
                    </IconButton>
                  </div>
                ))}
              </div>

              <FormField
                control={form.control}
                name="limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Results Limit: {field.value}</FormLabel>
                    <FormControl>
                      <Slider
                        min={5}
                        max={100}
                        step={5}
                        value={[field.value]}
                        onValueChange={(v) => field.onChange(v[0])}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={searchMutation.isPending}
                className="w-full"
              >
                {searchMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
              {actionWarning ? (
                <ActionWarningState
                  title="Search request failed"
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

      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">
              Results {result ? `(${result.totalCount})` : ''}
            </CardTitle>
            {result && (
              <span className="text-xs text-muted-foreground">
                {result.took.toFixed(0)}ms
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {!result ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm p-6">
                Run a search to see results
              </div>
            ) : result.results.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm p-6">
                No results found
              </div>
            ) : (
              <div className="divide-y divide-border">
                {result.results.map((item) => (
                  <TechnicalSearchResultItem key={item.id} result={item} />
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

function TechnicalSearchResultItem({ result }: { result: SearchResult }) {
  return (
    <div className="px-4 py-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="default" className="text-xs">
            {(result.score * 100).toFixed(0)}% total
          </Badge>
          {result.vectorScore !== undefined && (
            <Badge variant="outline" className="text-xs">
              Vec: {(result.vectorScore * 100).toFixed(0)}%
            </Badge>
          )}
          {result.bm25Score !== undefined && (
            <Badge variant="outline" className="text-xs">
              BM25: {(result.bm25Score * 100).toFixed(0)}%
            </Badge>
          )}
          {result.graphScore !== undefined && (
            <Badge variant="outline" className="text-xs">
              Graph: {(result.graphScore * 100).toFixed(0)}%
            </Badge>
          )}
        </div>
        {result.source && (
          <span className="text-xs text-muted-foreground shrink-0">
            {result.source}
          </span>
        )}
      </div>
      <p className="text-sm text-foreground">{result.content}</p>
      {result.highlights && result.highlights.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {result.highlights.map((highlight, i) => (
            <span
              key={i}
              className="text-xs bg-accent px-1.5 py-0.5 rounded"
            >
              {highlight}
            </span>
          ))}
        </div>
      )}
      {result.metadata && Object.keys(result.metadata).length > 0 && (
        <div className="mt-2 text-xs text-muted-foreground">
          {Object.entries(result.metadata).slice(0, 3).map(([key, value]) => (
            <span key={key} className="mr-3">
              {key}: {String(value)}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
