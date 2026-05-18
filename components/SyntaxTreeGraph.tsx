"use client"

import { useMemo, useState, useEffect } from "react"
import ReactFlow, { Background, Controls, Node, Edge, Position, MarkerType } from "reactflow"
import "reactflow/dist/style.css"
import { SyntaxTreeNode } from "@/lib/parser-types"
import { Card } from "@/components/ui/card"

interface SyntaxTreeGraphProps {
  syntax_tree: SyntaxTreeNode | null
}

const NODE_WIDTH = 140
const NODE_HEIGHT = 140

function buildTreeNodes(tree: SyntaxTreeNode, path = "0", depth = 0, order = 0) {
  const id = `${path}`
  const node = { id, symbol: tree.symbol, depth, order, children: [] as ReturnType<typeof buildTreeNodes>[] }
  node.children = tree.children.map((child, idx) => buildTreeNodes(child, `${path}-${idx}`, depth + 1, idx))
  return node
}

export default function SyntaxTreeGraph({ syntax_tree }: SyntaxTreeGraphProps) {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  const treeData = useMemo(() => {
    if (!syntax_tree) return null
    return buildTreeNodes(syntax_tree)
  }, [syntax_tree])

  const [nodes, edges] = useMemo(() => {
    if (!treeData) return [[], []] as [Node[], Edge[]]

    const rows: Record<number, Array<{ id: string; symbol: string; children: any[] }>> = {}
    function traverse(node: any) {
      rows[node.depth] = rows[node.depth] || []
      rows[node.depth].push(node)
      node.children.forEach(traverse)
    }
    traverse(treeData)

    const positions: Record<string, { x: number; y: number }> = {}
    Object.entries(rows).forEach(([depthString, nodesAtDepth]) => {
      const depth = Number(depthString)
      const total = nodesAtDepth.length
      const rowWidth = total * (NODE_WIDTH + 80)
      nodesAtDepth.forEach((item, index) => {
        positions[item.id] = {
          x: index * (NODE_WIDTH + 80) - rowWidth / 2 + 220,
          y: depth * (NODE_HEIGHT + 120),
        }
      })
    })

    const nodeList: Node[] = Object.values(rows).flatMap((level) =>
      level.map((item) => ({
        id: item.id,
        data: { label: item.symbol },
        position: positions[item.id],
        style: {
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
          padding: 16,
          borderRadius: 9999,
          border: "2px solid rgba(15, 23, 42, 0.12)",
          background: "#f8fafc",
          color: "#0f172a",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          whiteSpace: "normal",
          lineHeight: 1.25,
          boxShadow: "0 20px 40px rgba(15, 23, 42, 0.08)",
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      }))
    )

    const edgeList: Edge[] = []
    function buildEdges(node: any) {
      node.children.forEach((child: any) => {
        edgeList.push({
          id: `edge-${node.id}-${child.id}`,
          source: node.id,
          target: child.id,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#0f172a",
          },
          style: { stroke: "rgba(15, 23, 42, 0.7)", strokeWidth: 1.6 },
          animated: false,
        })
        buildEdges(child)
      })
    }
    buildEdges(treeData)

    return [nodeList, edgeList] as [Node[], Edge[]]
  }, [treeData])

  if (!hydrated) {
    return null
  }

  if (!syntax_tree) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-primary mb-3">Árbol de Sintaxis</h3>
        <p className="text-sm text-muted-foreground">No hay árbol sintáctico disponible.</p>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-primary">Árbol de Sintaxis</h3>
          <p className="text-sm text-muted-foreground">Visualización jerárquica del árbol sintáctico.</p>
        </div>
      </div>

      <div className="h-[520px] rounded-3xl border border-border/50 bg-background/80 overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          nodesDraggable
          nodesConnectable={false}
          zoomOnScroll
          panOnScroll
          zoomOnPinch
          zoomOnDoubleClick
          minZoom={0.05}
          maxZoom={16}
          fitViewOptions={{ padding: 0.16 }}
          attributionPosition="bottom-left"
        >
          <Background gap={16} size={1} color="#334155" />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </Card>
  )
}
