'use client'

import { useMemo, useState } from 'react'
import { ActionWarningState } from '@/components/dashboard/panels/shared/action-warning-state'
import { QueryErrorState } from '@/components/dashboard/panels/shared/query-error-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetSection,
  SheetSectionHeader,
  SheetPropertyRow,
} from '@/components/ui/sheet'
import { Search, ChevronLeft, ChevronRight, Eye, FileText, Image } from 'lucide-react'
import { toActionErrorMessage } from '@/lib/api'
import { useDelayedSheetSelection } from '@/lib/hooks/use-delayed-sheet-selection'
import { useRecordsList, useRecordDetail } from '@/lib/hooks/use-records'
import { cn } from '@/lib/utils'
import type { RecordsListParams } from '@/lib/schemas/records'

interface RecordsPanelProps {
  className?: string
}

const RECORDS_CONTENT_TYPE_SELECT_CONTENT_ID = 'records-content-type-select-content'

export function RecordsPanel({ className }: RecordsPanelProps) {
  const [params, setParams] = useState<RecordsListParams>({
    page: 1,
    pageSize: 20,
    contentType: 'all',
  })
  const [searchInput, setSearchInput] = useState('')
  const {
    open: isRecordDetailsOpen,
    selectedValue: selectedRecordId,
    selectValue: selectRecord,
    onOpenChange: onRecordDetailsOpenChange,
  } = useDelayedSheetSelection<string>()

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useRecordsList(params)
  const detailQuery = useRecordDetail(selectedRecordId)
  const selectedRecord = detailQuery.data

  const recordsActionWarning = useMemo(() => {
    if (isError && data) {
      return toActionErrorMessage(
        error,
        'Unable to refresh records from API.'
      )
    }
    return null
  }, [data, error, isError])

  const detailActionWarning = useMemo(() => {
    if (detailQuery.isError) {
      return toActionErrorMessage(
        detailQuery.error,
        'Unable to load record details from API.'
      )
    }
    return null
  }, [detailQuery.error, detailQuery.isError])

  if (isError && !data) {
    const errorMessage = toActionErrorMessage(
      error,
      'Unable to load records from API.'
    )

    return (
      <QueryErrorState
        title="Records unavailable"
        description={errorMessage}
        onRetry={() => {
          void refetch()
        }}
      />
    )
  }

  const handleSearch = () => {
    setParams({ ...params, search: searchInput, page: 1 })
  }

  const handlePageChange = (newPage: number) => {
    setParams({ ...params, page: newPage })
  }

  const handleContentTypeChange = (value: string) => {
    setParams({
      ...params,
      contentType: value as 'all' | 'text' | 'image',
      page: 1,
    })
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className={cn('space-y-4', className)}>
      {recordsActionWarning ? (
        <ActionWarningState
          title="Records request failed"
          description={recordsActionWarning}
          onRetry={() => {
            void refetch()
          }}
        />
      ) : null}

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search records..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Select
              value={params.contentType || 'all'}
              onValueChange={handleContentTypeChange}
            >
              <SelectTrigger
                className="w-32"
                aria-controls={RECORDS_CONTENT_TYPE_SELECT_CONTENT_ID}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent id={RECORDS_CONTENT_TYPE_SELECT_CONTENT_ID}>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="image">Image</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Type</TableHead>
                  <TableHead className="min-w-[300px]">Content</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Dimensions</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="h-4 w-8 bg-muted rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-full bg-muted rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-12 bg-muted rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  ))
                ) : (
                  data?.records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {record.contentType === 'text' ? (
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Image className="h-4 w-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm truncate max-w-[400px]">
                          {record.content}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {record.model}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {record.vectorDimensions}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(record.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="View record details"
                          onClick={() => selectRecord(record.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(data.page - 1) * data.pageSize + 1} to{' '}
            {Math.min(data.page * data.pageSize, data.totalCount)} of{' '}
            {data.totalCount} records
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={data.page <= 1}
              onClick={() => handlePageChange(data.page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {data.page} of {data.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={data.page >= data.totalPages}
              onClick={() => handlePageChange(data.page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Sheet */}
      <Sheet
        open={isRecordDetailsOpen}
        onOpenChange={onRecordDetailsOpenChange}
      >
        <SheetContent variant="geist-floating">
          <SheetHeader className="border-0 p-6 text-left">
            <SheetTitle className="text-lg font-semibold">Record Details</SheetTitle>
          </SheetHeader>
          {detailActionWarning ? (
            <div className="p-6">
              <ActionWarningState
                title="Record detail request failed"
                description={detailActionWarning}
                onRetry={() => {
                  void detailQuery.refetch()
                }}
              />
            </div>
          ) : null}
          {selectedRecord && !detailActionWarning && (
            <div className="px-6 py-4 space-y-8">
              {/* Content Section */}
              <SheetSection>
                <SheetSectionHeader>Content</SheetSectionHeader>
                <p className="text-sm leading-5 text-foreground">
                  {selectedRecord.content}
                </p>
              </SheetSection>

              {/* Properties Grid */}
              <SheetSection>
                <SheetSectionHeader className="mb-1">Properties</SheetSectionHeader>
                <div className="space-y-0">
                  <SheetPropertyRow
                    label="Type"
                    value={<Badge variant="gray-subtle" className="capitalize">{selectedRecord.contentType}</Badge>}
                  />
                  <SheetPropertyRow
                    label="Model"
                    value={<Badge variant="blue-subtle" className="text-xs font-mono">{selectedRecord.model}</Badge>}
                  />
                  <SheetPropertyRow
                    label="Dimensions"
                    value={<span className="font-mono">{selectedRecord.vectorDimensions}</span>}
                  />
                  <SheetPropertyRow
                    label="Source"
                    value={selectedRecord.source || '—'}
                    isLast
                  />
                </div>
              </SheetSection>

              {/* Metadata Section */}
              {selectedRecord.metadata && Object.keys(selectedRecord.metadata).length > 0 && (
                <SheetSection>
                  <SheetSectionHeader>Metadata</SheetSectionHeader>
                  <div className="bg-muted/30 rounded-lg border border-border/40 p-4">
                    <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap break-words leading-relaxed">
{JSON.stringify(selectedRecord.metadata, null, 2)}
                    </pre>
                  </div>
                </SheetSection>
              )}

              {/* Vector Preview Section */}
              {selectedRecord.vector && (
                <SheetSection>
                  <SheetSectionHeader>Vector Preview</SheetSectionHeader>
                  <div className="bg-muted/30 rounded-lg border border-border/40 p-4 max-h-[180px] overflow-y-auto">
                    <code className="text-xs font-mono text-foreground/80 break-all leading-relaxed">
                      [{selectedRecord.vector.slice(0, 10).map(v => v.toFixed(6)).join(', ')}, ...]
                    </code>
                  </div>
                </SheetSection>
              )}

              {/* Timestamps */}
              <section className="pt-6 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="text-sm font-medium">{formatDate(selectedRecord.createdAt)}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-xs text-muted-foreground">Updated</p>
                    <p className="text-sm font-medium">{formatDate(selectedRecord.updatedAt)}</p>
                  </div>
                </div>
              </section>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
