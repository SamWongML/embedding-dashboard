"use client"

import type { ComponentProps } from "react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetSection,
  SheetSectionHeader,
} from "@/components/ui/sheet"
import type { NodeDetail } from "@/lib/schemas/graph"

interface NodeDetailsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  nodeDetail: NodeDetail | null | undefined
  onAnimationEnd?: ComponentProps<typeof SheetContent>["onAnimationEnd"]
}

export function NodeDetailsSheet({
  open,
  onOpenChange,
  nodeDetail,
  onAnimationEnd,
}: NodeDetailsSheetProps) {
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
    >
      <SheetContent
        variant="geist-floating"
        onAnimationEnd={onAnimationEnd}
      >
        <SheetHeader className="border-0 p-6 text-left">
          <SheetTitle className="text-lg font-semibold">Node Details</SheetTitle>
        </SheetHeader>
        {nodeDetail ? (
          <div className="px-6 py-4 space-y-8">
            {/* Label Section */}
            <SheetSection>
              <SheetSectionHeader>Label</SheetSectionHeader>
              <p className="text-lg font-semibold text-foreground">
                {nodeDetail.node.label}
              </p>
            </SheetSection>

            {/* Type Section */}
            <SheetSection>
              <SheetSectionHeader>Type</SheetSectionHeader>
              <div className="flex gap-2">
                <Badge variant="blue-subtle">{nodeDetail.node.type}</Badge>
              </div>
            </SheetSection>

            {/* Properties Section */}
            <SheetSection>
              <SheetSectionHeader>Properties</SheetSectionHeader>
              <div className="bg-muted/30 rounded-lg border border-border/40 p-4">
                <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap break-words leading-relaxed">
                  {JSON.stringify(nodeDetail.node.properties, null, 2)}
                </pre>
              </div>
            </SheetSection>

            {/* Connections Section */}
            <SheetSection>
              <SheetSectionHeader>
                Connections ({nodeDetail.incomingEdges.length + nodeDetail.outgoingEdges.length})
              </SheetSectionHeader>
              <ScrollArea className="h-[240px]">
                <div className="space-y-2">
                  {nodeDetail.outgoingEdges.map((edge) => {
                    const targetNode = nodeDetail.relatedNodes.find(
                      (node) => node.id === edge.target
                    )

                    return (
                      <div
                        key={edge.id}
                        className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/20 p-3 text-sm leading-5 transition-colors hover:bg-muted/40"
                      >
                        <Badge variant="gray-subtle" className="shrink-0">
                          {edge.type}
                        </Badge>
                        <span className="text-muted-foreground shrink-0">→</span>
                        <span className="font-medium truncate">
                          {targetNode?.label || edge.target}
                        </span>
                      </div>
                    )
                  })}
                  {nodeDetail.incomingEdges.map((edge) => {
                    const sourceNode = nodeDetail.relatedNodes.find(
                      (node) => node.id === edge.source
                    )

                    return (
                      <div
                        key={edge.id}
                        className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/20 p-3 text-sm leading-5 transition-colors hover:bg-muted/40"
                      >
                        <span className="font-medium truncate">
                          {sourceNode?.label || edge.source}
                        </span>
                        <span className="text-muted-foreground shrink-0">→</span>
                        <Badge variant="gray-subtle" className="shrink-0">
                          {edge.type}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </SheetSection>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
