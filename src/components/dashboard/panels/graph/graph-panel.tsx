'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  drag,
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  select,
  zoom,
  zoomIdentity,
} from 'd3'
import { useGraphData, useNodeDetail } from '@/lib/hooks/use-graph'
import { cn } from '@/lib/utils'
import type { GraphFilters, GraphNode } from '@/lib/schemas/graph'
import { GraphCanvas } from './components/graph-canvas'
import { GraphControls } from './components/graph-controls'
import { NodeDetailsSheet } from './components/node-details-sheet'
import { QueryErrorState } from '@/components/dashboard/panels/shared/query-error-state'
import {
  colorByGraphNodeType,
  graphLabelColor,
  graphLinkColor,
  graphNodeStrokeColor,
} from '@/components/charts/chart-theme'

interface GraphPanelProps {
  className?: string
}

function resolveGraphPoint(value: unknown): { x?: number; y?: number } | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  return value as { x?: number; y?: number }
}

export function GraphPanel({ className }: GraphPanelProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [filters, setFilters] = useState<GraphFilters>({ depth: 2, limit: 100 })
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  const {
    data: graphData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGraphData(filters)
  const { data: nodeDetail } = useNodeDetail(selectedNodeId)

  const handleZoom = useCallback((direction: 'in' | 'out' | 'reset') => {
    if (!svgRef.current) return

    const svg = select(svgRef.current)
    const zoomBehavior = zoom<SVGSVGElement, unknown>()

    if (direction === 'reset') {
      svg.transition().duration(300).call(zoomBehavior.transform, zoomIdentity)
      return
    }

    const scale = direction === 'in' ? 1.3 : 0.7
    svg.transition().duration(300).call(zoomBehavior.scaleBy, scale)
  }, [])

  useEffect(() => {
    if (!svgRef.current || !graphData || isLoading) return

    const svg = select(svgRef.current)
    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight
    const nodeIds = new Set(graphData.nodes.map((node) => node.id))
    const graphEdges = graphData.edges.filter(
      (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target)
    )

    svg.selectAll('*').remove()

    const container = svg.append('g')
    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform)
      })

    svg.call(zoomBehavior)

    const simulation = forceSimulation(graphData.nodes)
      .force('link', forceLink(graphEdges).id((d) => (d as GraphNode).id).distance(100))
      .force('charge', forceManyBody().strength(-300))
      .force('center', forceCenter(width / 2, height / 2))
      .force('collision', forceCollide().radius(40))

    const link = container.append('g')
      .attr('stroke', graphLinkColor)
      .attr('stroke-opacity', 0.8)
      .attr('stroke-width', 1.5)
      .selectAll('line')
      .data(graphEdges)
      .join('line')

    const node = container.append('g')
      .selectAll('g')
      .data(graphData.nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .on('click', (_, data) => {
        setSelectedNodeId(data.id)
      })

    const dragBehavior = drag<SVGGElement, GraphNode>()
      .on('start', function onStart(event) {
        const data = select(this).datum() as GraphNode & {
          fx?: number | null
          fy?: number | null
          x?: number
          y?: number
        }
        if (!event.active) simulation.alphaTarget(0.3).restart()
        data.fx = data.x ?? null
        data.fy = data.y ?? null
      })
      .on('drag', function onDrag(event) {
        const data = select(this).datum() as GraphNode & {
          fx?: number | null
          fy?: number | null
        }
        data.fx = event.x
        data.fy = event.y
      })
      .on('end', function onEnd(event) {
        const data = select(this).datum() as GraphNode & {
          fx?: number | null
          fy?: number | null
        }
        if (!event.active) simulation.alphaTarget(0)
        data.fx = null
        data.fy = null
      })

    node.call(dragBehavior as never)

    node.append('circle')
      .attr('r', 20)
      .attr('fill', (data) => colorByGraphNodeType(data.type))
      .attr('stroke', graphNodeStrokeColor)
      .attr('stroke-width', 2)

    node.append('text')
      .text((data) => data.label.slice(0, 12))
      .attr('text-anchor', 'middle')
      .attr('dy', 35)
      .attr('font-size', 10)
      .attr('fill', graphLabelColor)

    simulation.on('tick', () => {
      link
        .attr('x1', (data) => resolveGraphPoint(data.source)?.x ?? 0)
        .attr('y1', (data) => resolveGraphPoint(data.source)?.y ?? 0)
        .attr('x2', (data) => resolveGraphPoint(data.target)?.x ?? 0)
        .attr('y2', (data) => resolveGraphPoint(data.target)?.y ?? 0)

      node.attr('transform', (data) => `translate(${data.x || 0},${data.y || 0})`)
    })

    return () => {
      simulation.stop()
    }
  }, [graphData, isLoading])

  if (isError) {
    const errorMessage = error instanceof Error ? error.message : 'Unable to load graph data.'
    return (
      <QueryErrorState
        title="Graph unavailable"
        description={errorMessage}
        onRetry={() => {
          void refetch()
        }}
      />
    )
  }

  if (!isLoading && !graphData) {
    return (
      <QueryErrorState
        title="Graph unavailable"
        description="No graph data is available yet."
      />
    )
  }

  return (
    <div className={cn('grid gap-4 lg:grid-cols-4', className)}>
      <GraphControls
        filters={filters}
        onFiltersChange={setFilters}
        onZoom={handleZoom}
        graphData={graphData}
      />
      <GraphCanvas svgRef={svgRef} isLoading={isLoading} />
      <NodeDetailsSheet
        selectedNodeId={selectedNodeId}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedNodeId(null)
          }
        }}
        nodeDetail={nodeDetail}
      />
    </div>
  )
}
