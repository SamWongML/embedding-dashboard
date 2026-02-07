"use client"

import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import type { GraphData, GraphFilters } from "@/lib/schemas/graph"
import { graphNodeColorByType } from "@/components/charts/chart-theme"

interface GraphControlsProps {
  filters: GraphFilters
  onFiltersChange: (filters: GraphFilters) => void
  onZoom: (direction: "in" | "out" | "reset") => void
  graphData: GraphData | undefined
}

export function GraphControls({
  filters,
  onFiltersChange,
  onZoom,
  graphData,
}: GraphControlsProps) {
  return (
    <Card className="lg:col-span-1">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Graph Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Depth: {filters.depth}</label>
          <Slider
            min={1}
            max={5}
            step={1}
            value={[filters.depth || 2]}
            onValueChange={(value) => onFiltersChange({ ...filters, depth: value[0] })}
            className="mt-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Limit: {filters.limit}</label>
          <Slider
            min={10}
            max={500}
            step={10}
            value={[filters.limit || 100]}
            onValueChange={(value) => onFiltersChange({ ...filters, limit: value[0] })}
            className="mt-2"
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onZoom("in")}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onZoom("out")}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onZoom("reset")}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div className="border-t pt-4">
          <h4 className="mb-2 text-sm font-medium">Legend</h4>
          <div className="space-y-2">
            {Object.entries(graphNodeColorByType)
              .filter(([key]) => key !== "default")
              .map(([type, color]) => (
                <div key={type} className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs capitalize">{type.replace("-", " ")}</span>
                </div>
              ))}
          </div>
        </div>

        {graphData ? (
          <div className="border-t pt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Nodes: {graphData.nodes.length}</Badge>
              <Badge variant="outline">Edges: {graphData.edges.length}</Badge>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
