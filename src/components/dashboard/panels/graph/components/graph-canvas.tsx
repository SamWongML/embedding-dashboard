"use client"

import { Card, CardContent } from "@/components/ui/card"

interface GraphCanvasProps {
  svgRef: React.RefObject<SVGSVGElement | null>
  isLoading: boolean
}

export function GraphCanvas({ svgRef, isLoading }: GraphCanvasProps) {
  return (
    <Card className="min-h-[400px] lg:col-span-3 lg:min-h-[500px]">
      <CardContent className="h-full p-0">
        {isLoading ? (
          <div className="flex h-full min-h-[400px] items-center justify-center">
            <div className="animate-pulse text-muted-foreground">
              Loading graph...
            </div>
          </div>
        ) : (
          <svg
            ref={svgRef}
            className="h-full w-full"
            style={{ minHeight: "400px" }}
          />
        )}
      </CardContent>
    </Card>
  )
}
