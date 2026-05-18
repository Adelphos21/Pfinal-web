"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import ReactFlow, { Background, Controls, Node, Edge, Position, MarkerType, useNodesState, useEdgesState } from "reactflow"
import { ParserType, Automaton } from "@/lib/parser-types"
import { Card } from "@/components/ui/card"
import ParallelEdge from "@/components/ParallelEdge"

interface AutomatonGraphProps {
  title: string
  automaton: Automaton
  parser_type: ParserType
}

const NODE_WIDTH = 220
const NODE_HEIGHT = 100

export default function AutomatonGraph({ title, automaton, parser_type }: AutomatonGraphProps) {
  const [fitView, setFitView] = useState(false)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const layerMap = useMemo(() => {
    const adjacency = new Map<number, number[]>()
    automaton.transitions.forEach((transition) => {
      const source = transition.source
      const target = transition.target
      adjacency.set(source, [...(adjacency.get(source) || []), target])
    })

    const initialStates = automaton.states.filter((state) => state.is_initial).map((state) => state.id)
    const depth = new Map<number, number>()
    const queue: number[] = initialStates.length ? [...initialStates] : [automaton.states[0]?.id]

    queue.forEach((nodeId) => depth.set(nodeId, 0))

    while (queue.length) {
      const current = queue.shift()!
      const currentDepth = depth.get(current) ?? 0
      const neighbors = adjacency.get(current) || []
      neighbors.forEach((next) => {
        if (!depth.has(next) || (depth.get(next) ?? 0) > currentDepth + 1) {
          depth.set(next, currentDepth + 1)
          queue.push(next)
        }
      })
    }

    const rows = new Map<number, number[]>()
    automaton.states.forEach((state) => {
      const level = depth.get(state.id) ?? 0
      rows.set(level, [...(rows.get(level) || []), state.id])
    })

    return { depth, rows }
  }, [automaton.states, automaton.transitions])

  const generatedNodes: Node[] = useMemo(() => {
    const rows = Array.from(layerMap.rows.entries()).sort((a, b) => a[0] - b[0])
    const positions = new Map<number, { x: number; y: number }>()

    rows.forEach(([level, ids]) => {
      const rowWidth = ids.length * (NODE_WIDTH + 140)
      ids.forEach((id, index) => {
        positions.set(id, {
          x: index * (NODE_WIDTH + 140) - rowWidth / 2 + 260,
          y: level * (NODE_HEIGHT + 180),
        })
      })
    })

    return automaton.states.map((state) => {
      const position = positions.get(state.id) || { x: 0, y: 0 }
      const borderStyle = state.is_accepting
        ? "2px solid #1657f3"
        : state.is_initial
        ? "2px dashed #0f172a"
        : "1px solid rgba(15, 23, 42, 0.25)"

      const background = state.is_accepting ? "#f8fafc" : "#ffffff"
      const color = "#0f172a"
      const label = [state.label, "", ...(state.items || [])].join("\n")

      return {
        id: String(state.id),
        position,
        data: { label },
        style: {
          width: NODE_WIDTH,
          minHeight: NODE_HEIGHT,
          padding: 18,
          borderRadius: 28,
          border: borderStyle,
          background,
          color,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
          whiteSpace: "pre-wrap",
          lineHeight: 1.5,
          boxShadow: "0 18px 35px rgba(15, 23, 42, 0.08)",
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      }
    })
  }, [automaton.states, layerMap])

  const generatedEdges: Edge[] = useMemo(() => {
    // Recompute node positions similarly to generatedNodes to compute midpoints
    const rows = Array.from(layerMap.rows.entries()).sort((a, b) => a[0] - b[0])
    const positions = new Map<number, { x: number; y: number }>()

    rows.forEach(([level, ids]) => {
      const rowWidth = ids.length * (NODE_WIDTH + 80)
      ids.forEach((id, index) => {
        positions.set(id, {
          x: index * (NODE_WIDTH + 80) - rowWidth / 2 + 180,
          y: level * (NODE_HEIGHT + 140),
        })
      })
    })

    // group edges by source node to separate outgoing transitions independently
    const sourceCount = new Map<string, number>()
    automaton.transitions.forEach((t) => {
      const key = String(t.source)
      sourceCount.set(key, (sourceCount.get(key) ?? 0) + 1)
    })

    const sourceIndex = new Map<string, number>()

    return automaton.transitions.map((transition, index) => {
      const id = `edge-${transition.source}-${transition.target}-${transition.symbol}-${index}`
      const sourceKey = String(transition.source)
      const total = sourceCount.get(sourceKey) ?? 1
      const idx = sourceIndex.get(sourceKey) ?? 0
      sourceIndex.set(sourceKey, idx + 1)

      return {
        id,
        source: String(transition.source),
        target: String(transition.target),
        label: transition.symbol,
        type: "parallel",
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#0f172a",
          width: 30,
          height: 30,
        },
        animated: false,
        style: {
          stroke: "#0f172a",
          strokeWidth: 3,
          strokeLinecap: "round",
        },
        labelStyle: {
          fill: "#0f172a",
          fontSize: 13,
          fontFamily: "ui-monospace, monospace",
          background: "rgba(255,255,255,0.96)",
          padding: "4px 8px",
          borderRadius: 8,
        },
        data: {
          index: idx,
          total,
          spacing: 42,
        },
      }
    })
  }, [automaton.transitions, layerMap])

  const handleInit = useCallback(() => {
    if (!fitView) {
      setFitView(true)
    }
  }, [fitView])

  useEffect(() => {
    setNodes(generatedNodes)
    setEdges(generatedEdges)
    setFitView(true)
  }, [generatedNodes, generatedEdges, setEdges, setNodes])

  if (!automaton || automaton.states.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-primary mb-3">{title}</h3>
        <p className="text-sm text-muted-foreground">No hay datos de autómata disponibles para {parser_type.toUpperCase()}.</p>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-primary">{title}</h3>
          <p className="text-sm text-muted-foreground">Vista del autómata {parser_type.toUpperCase()}.</p>
        </div>
        <div className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
          {automaton.states.length} estados
        </div>
      </div>
      <div className="h-[480px] rounded-3xl border border-border/50 bg-background/80 overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView={fitView}
          nodesDraggable
          nodesConnectable={false}
          zoomOnScroll
          panOnScroll
          zoomOnPinch
          zoomOnDoubleClick
          minZoom={0.05}
          maxZoom={16}
          fitViewOptions={{ padding: 0.2 }}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onInit={handleInit}
          attributionPosition="bottom-left"
          edgeTypes={{ parallel: ParallelEdge }}
        >
          <Background gap={16} size={1} color="#334155" />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </Card>
  )
}
