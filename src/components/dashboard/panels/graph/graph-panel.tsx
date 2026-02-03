'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { useGraphData, useNodeDetail } from '@/lib/hooks/use-graph'
import { cn } from '@/lib/utils'
import type { GraphNode, GraphEdge, GraphFilters } from '@/lib/schemas/graph'

interface GraphPanelProps {
  className?: string
}

const nodeColors: Record<string, string> = {
  document: 'oklch(60% 0.18 260)',
  topic: 'oklch(65% 0.15 185)',
  'user-group': 'oklch(70% 0.16 80)',
  default: 'oklch(50% 0.1 240)',
}

export function GraphPanel({ className }: GraphPanelProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [filters, setFilters] = useState<GraphFilters>({ depth: 2, limit: 100 })
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  const { data: graphData, isLoading } = useGraphData(filters)
  const { data: nodeDetail } = useNodeDetail(selectedNodeId)

  const handleZoom = useCallback((direction: 'in' | 'out' | 'reset') => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    const zoom = d3.zoom<SVGSVGElement, unknown>()

    if (direction === 'reset') {
      svg.transition().duration(300).call(zoom.transform, d3.zoomIdentity)
    } else {
      const scale = direction === 'in' ? 1.3 : 0.7
      svg.transition().duration(300).call(zoom.scaleBy, scale)
    }
  }, [])

  useEffect(() => {
    if (!svgRef.current || !graphData || isLoading) return

    const svg = d3.select(svgRef.current)
    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight

    svg.selectAll('*').remove()

    const g = svg.append('g')

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })

    svg.call(zoom)

    const simulation = d3.forceSimulation(graphData.nodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(graphData.edges)
        .id((d: unknown) => (d as GraphNode).id)
        .distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40))

    const link = g.append('g')
      .attr('stroke', 'oklch(50% 0.01 240 / 30%)')
      .attr('stroke-width', 1.5)
      .selectAll('line')
      .data(graphData.edges)
      .join('line')

    const node = g.append('g')
      .selectAll('g')
      .data(graphData.nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .on('click', (_, d) => {
        setSelectedNodeId(d.id)
      })

    // Add drag behavior
    const dragBehavior = d3.drag<SVGGElement, GraphNode>()
      .on('start', function(event) {
        const d = d3.select(this).datum() as GraphNode & d3.SimulationNodeDatum
        if (!event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      })
      .on('drag', function(event) {
        const d = d3.select(this).datum() as GraphNode & d3.SimulationNodeDatum
        d.fx = event.x
        d.fy = event.y
      })
      .on('end', function(event) {
        const d = d3.select(this).datum() as GraphNode & d3.SimulationNodeDatum
        if (!event.active) simulation.alphaTarget(0)
        d.fx = null
        d.fy = null
      })

    node.call(dragBehavior as never)

    node.append('circle')
      .attr('r', 20)
      .attr('fill', (d) => nodeColors[d.type] || nodeColors.default)
      .attr('stroke', 'oklch(100% 0 0)')
      .attr('stroke-width', 2)

    node.append('text')
      .text((d) => d.label.slice(0, 12))
      .attr('text-anchor', 'middle')
      .attr('dy', 35)
      .attr('font-size', 10)
      .attr('fill', 'oklch(50% 0.01 240)')

    simulation.on('tick', () => {
      link
        .attr('x1', (d: unknown) => ((d as { source: GraphNode & d3.SimulationNodeDatum }).source.x || 0))
        .attr('y1', (d: unknown) => ((d as { source: GraphNode & d3.SimulationNodeDatum }).source.y || 0))
        .attr('x2', (d: unknown) => ((d as { target: GraphNode & d3.SimulationNodeDatum }).target.x || 0))
        .attr('y2', (d: unknown) => ((d as { target: GraphNode & d3.SimulationNodeDatum }).target.y || 0))

      node.attr('transform', (d: GraphNode & d3.SimulationNodeDatum) => `translate(${d.x || 0},${d.y || 0})`)
    })

    return () => {
      simulation.stop()
    }
  }, [graphData, isLoading])

  return (
    <div className={cn('grid gap-4 lg:grid-cols-4', className)}>
      {/* Controls */}
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
              onValueChange={(v) => setFilters({ ...filters, depth: v[0] })}
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
              onValueChange={(v) => setFilters({ ...filters, limit: v[0] })}
              className="mt-2"
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleZoom('in')}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleZoom('out')}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleZoom('reset')}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Legend</h4>
            <div className="space-y-2">
              {Object.entries(nodeColors).filter(([k]) => k !== 'default').map(([type, color]) => (
                <div key={type} className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs capitalize">{type.replace('-', ' ')}</span>
                </div>
              ))}
            </div>
          </div>

          {graphData && (
            <div className="pt-4 border-t text-sm text-muted-foreground">
              <p>Nodes: {graphData.nodes.length}</p>
              <p>Edges: {graphData.edges.length}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Graph Canvas */}
      <Card className="lg:col-span-3 min-h-[400px] lg:min-h-[500px]">
        <CardContent className="p-0 h-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="animate-pulse text-muted-foreground">
                Loading graph...
              </div>
            </div>
          ) : (
            <svg
              ref={svgRef}
              className="w-full h-full"
              style={{ minHeight: '400px' }}
            />
          )}
        </CardContent>
      </Card>

      {/* Node Detail Sheet */}
      <Sheet
        open={!!selectedNodeId}
        onOpenChange={(open) => !open && setSelectedNodeId(null)}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Node Details</SheetTitle>
          </SheetHeader>
          {nodeDetail && (
            <div className="mt-6 space-y-6">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Label
                </h4>
                <p className="text-lg font-medium">{nodeDetail.node.label}</p>
              </div>

              <div className="flex gap-2">
                <Badge>{nodeDetail.node.type}</Badge>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  Properties
                </h4>
                <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
                  {JSON.stringify(nodeDetail.node.properties, null, 2)}
                </pre>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  Connections ({nodeDetail.incomingEdges.length + nodeDetail.outgoingEdges.length})
                </h4>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {nodeDetail.outgoingEdges.map((edge) => {
                      const targetNode = nodeDetail.relatedNodes.find(
                        (n) => n.id === edge.target
                      )
                      return (
                        <div
                          key={edge.id}
                          className="text-sm p-2 bg-muted rounded-md"
                        >
                          <span className="text-muted-foreground">
                            {edge.type} →
                          </span>{' '}
                          {targetNode?.label || edge.target}
                        </div>
                      )
                    })}
                    {nodeDetail.incomingEdges.map((edge) => {
                      const sourceNode = nodeDetail.relatedNodes.find(
                        (n) => n.id === edge.source
                      )
                      return (
                        <div
                          key={edge.id}
                          className="text-sm p-2 bg-muted rounded-md"
                        >
                          {sourceNode?.label || edge.source}{' '}
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
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
