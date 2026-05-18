"use client"

import type React from "react"
import { useState, useMemo, useRef, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react"

interface ASTSectionProps {
  data: any
}

interface TreeNode {
  id: string
  label: string
  x: number
  y: number
  children: string[]
  subtreeWidth?: number
}

export default function ASTSection({ data }: ASTSectionProps) {
  const exampleData = {
    nodes: [
      { id: 0, label: "S" },
      { id: 1, label: "C" },
      { id: 2, label: "c" },
      { id: 3, label: "C" },
      { id: 4, label: "d" },
      { id: 5, label: "C" },
      { id: 6, label: "d" },
    ],
    edges: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 1, to: 3 },
      { from: 3, to: 4 },
      { from: 0, to: 5 },
      { from: 5, to: 6 },
    ],
  }

  const astGraph = data?.ast_graph || exampleData
  const astString = data?.ast_string || "No se generó AST"
  const [zoom, setZoom] = useState<number>(1)
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement | null>(null)

  const NODE_H_SPACING = 80
  const NODE_V_SPACING = 120
  const NODE_RADIUS = 30

  const treeData = useMemo(() => {
    if (!astGraph?.nodes || astGraph.nodes.length === 0) return null

    const nodeMap = new Map<string, TreeNode>()
    const childrenMap = new Map<string, string[]>()

    astGraph.nodes.forEach((node: any) => {
      const id = String(node.id)
      nodeMap.set(id, { id, label: node.label, x: 0, y: 0, children: [] })
      childrenMap.set(id, [])
    })

    astGraph.edges.forEach((edge: any) => {
      const from = String(edge.from)
      const to = String(edge.to)
      const arr = childrenMap.get(from) || []
      arr.push(to)
      childrenMap.set(from, arr)
    })

    childrenMap.forEach((children, id) => {
      const n = nodeMap.get(id)
      if (n) n.children = children
    })

    const hasParent = new Set(astGraph.edges.map((e: any) => String(e.to)))
    const roots = Array.from(nodeMap.values()).filter((n) => !hasParent.has(n.id))

    if (roots.length === 0) return null

    // Si hay varias raíces, las colocamos como hijos de un nodo virtual para layout
    let rootIds: string[] = roots.map(r => r.id)
    let virtualRootId: string | null = null
    if (rootIds.length > 1) {
      virtualRootId = "__virtual_root__"
      nodeMap.set(virtualRootId, { id: virtualRootId, label: "", x: 0, y: 0, children: rootIds })
    }

    const root = virtualRootId ? nodeMap.get(virtualRootId)! : nodeMap.get(rootIds[0])!

    const calculateSubtreeData = (nodeId: string): { width: number } => {
      const node = nodeMap.get(nodeId)!
      if (node.children.length === 0) {
        node.subtreeWidth = NODE_H_SPACING
        return { width: NODE_H_SPACING }
      }
      let total = 0
      node.children.forEach(cid => {
        const cw = calculateSubtreeData(cid)
        total += cw.width
      })
      node.subtreeWidth = total
      return { width: total }
    }
    calculateSubtreeData(root.id)

    let minX = Infinity, maxX = -Infinity, maxY = -Infinity

    const calculatePositions = (nodeId: string, x: number, y: number) => {
      const node = nodeMap.get(nodeId)
      if (!node) return
      node.x = x
      node.y = y
      minX = Math.min(minX, x)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
      if (node.children.length === 0) return
      const total = node.subtreeWidth || 0
      let curX = x - total / 2
      node.children.forEach(cid => {
        const c = nodeMap.get(cid)!
        const w = c.subtreeWidth || NODE_H_SPACING
        calculatePositions(cid, curX + w / 2, y + NODE_V_SPACING)
        curX += w
      })
    }

    calculatePositions(root.id, 0, 50)

    const padding = NODE_RADIUS + 30
    const offsetX = -minX + padding
    nodeMap.forEach(n => { n.x += offsetX })
    const width = (maxX - minX) + padding * 2
    const height = maxY + padding * 2

    // Si se creó un virtual root, eliminarlo de nodeMap para render (pero mantener posiciones de sus hijos)
    if (virtualRootId) {
      nodeMap.delete(virtualRootId)
    }

    return { nodeMap, width, height }
  }, [astGraph])

  // Panning handlers (div)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // solo botón izquierdo
    if (e.button !== 0) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Wheel to zoom (mantener posición del cursor relativamente estable sería más complejo; esto es un buen comienzo)
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    const delta = Math.sign(e.deltaY) // 1 or -1
    setZoom(prev => {
      const next = Math.max(0.5, Math.min(3, prev - delta * 0.08))
      return next
    })
  }, [])

  const handleZoom = (direction: number) => {
    setZoom((prev) => Math.max(0.5, Math.min(3, prev + direction * 0.2)))
  }

  const handleReset = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  if (!treeData) {
    return (
      <div className="space-y-4">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Árbol de Sintaxis Abstracta</h3>
          <div className="text-center py-8 text-foreground/50">
            <p>No se generó AST para esta entrada</p>
          </div>
        </Card>
      </div>
    )
  }

  // Helper: calcular punto en la circunferencia del nodo para que las líneas no entren al centro
  const pointOnCircle = (x1: number, y1: number, x2: number, y2: number, r: number) => {
    const dx = x2 - x1
    const dy = y2 - y1
    const d = Math.sqrt(dx*dx + dy*dy) || 1
    const ux = dx / d
    const uy = dy / d
    return { x: x1 + ux * r, y: y1 + uy * r }
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary">Árbol de Sintaxis Abstracta</h3>
          <div className="flex gap-2">
            <button onClick={() => handleZoom(1)} className="p-2 hover:bg-primary/10 rounded-lg transition-colors" title="Zoom in">
              <ZoomIn size={18} className="text-primary" />
            </button>
            <button onClick={() => handleZoom(-1)} className="p-2 hover:bg-primary/10 rounded-lg transition-colors" title="Zoom out">
              <ZoomOut size={18} className="text-primary" />
            </button>
            <button onClick={handleReset} className="p-2 hover:bg-primary/10 rounded-lg transition-colors" title="Reset view">
              <RotateCcw size={18} className="text-primary" />
            </button>
          </div>
        </div>

        <div
          ref={containerRef}
          className={`border border-primary/20 rounded-lg overflow-hidden bg-gradient-to-br from-secondary/5 to-primary/5 ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
          style={{ height: "500px", userSelect: "none", touchAction: "none" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${treeData.width} ${treeData.height}`}
            preserveAspectRatio="xMidYMid meet"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "0 0",
              transition: isDragging ? "none" : "transform 0.16s ease-out",
            }}
          >
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>

            {/* Edges */}
            {Array.from(treeData.nodeMap.values()).map((node) =>
              node.children.map((childId) => {
                const child = treeData.nodeMap.get(childId)
                if (!child) return null
                const p1 = pointOnCircle(node.x, node.y, child.x, child.y, NODE_RADIUS - 2)
                const p2 = pointOnCircle(child.x, child.y, node.x, node.y, NODE_RADIUS - 2)
                return (
                  <line
                    key={`edge-${node.id}-${child.id}`}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    opacity={0.6}
                  />
                )
              })
            )}

            {/* Nodes */}
            {Array.from(treeData.nodeMap.values()).map((node) => (
              <g key={`node-${node.id}`}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={NODE_RADIUS}
                  fill="url(#gradient)"
                  opacity={0.95}
                  className="hover:opacity-100 transition-opacity"
                />
                <circle cx={node.x} cy={node.y} r={NODE_RADIUS} fill="none" stroke="#0ea5e9" strokeWidth="2" opacity="0.28" />
                <text
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="font-mono font-semibold text-xs"
                  fill="white"
                  pointerEvents="none"
                >
                  {node.label}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-semibold text-primary/70 mb-2">Representación en Texto</h4>
          <pre className="font-mono text-xs bg-secondary/10 p-4 rounded overflow-x-auto text-foreground/80 whitespace-pre-wrap break-words max-h-48">
            {astString}
          </pre>
        </div>
      </Card>
    </div>
  )
}
