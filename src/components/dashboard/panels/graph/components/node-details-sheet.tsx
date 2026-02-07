"use client"

import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import type { NodeDetail } from "@/lib/schemas/graph"

interface NodeDetailsSheetProps {
  selectedNodeId: string | null
  onOpenChange: (open: boolean) => void
  nodeDetail: NodeDetail | null | undefined
}

export function NodeDetailsSheet({
  selectedNodeId,
  onOpenChange,
  nodeDetail,
}: NodeDetailsSheetProps) {
  return (
    <Sheet
      open={!!selectedNodeId}
      onOpenChange={onOpenChange}
    >
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Node Details</SheetTitle>
        </SheetHeader>
        {nodeDetail ? (
          <div className="mt-6 space-y-6">
            <div>
              <h4 className="mb-1 text-sm font-medium text-muted-foreground">
                Label
              </h4>
              <p className="text-lg font-medium">{nodeDetail.node.label}</p>
            </div>

            <div className="flex gap-2">
              <Badge>{nodeDetail.node.type}</Badge>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                Properties
              </h4>
              <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
                {JSON.stringify(nodeDetail.node.properties, null, 2)}
              </pre>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                Connections ({nodeDetail.incomingEdges.length + nodeDetail.outgoingEdges.length})
              </h4>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {nodeDetail.outgoingEdges.map((edge) => {
                    const targetNode = nodeDetail.relatedNodes.find(
                      (node) => node.id === edge.target
                    )

                    return (
                      <div
                        key={edge.id}
                        className="rounded-md bg-muted p-2 text-sm"
                      >
                        <span className="text-muted-foreground">
                          {edge.type} →
                        </span>{" "}
                        {targetNode?.label || edge.target}
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
                        className="rounded-md bg-muted p-2 text-sm"
                      >
                        {sourceNode?.label || edge.source}{" "}
                        <span className="text-muted-foreground">
                          → {edge.type}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
