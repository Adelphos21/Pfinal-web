"use client"

import React from "react"
import { EdgeProps, getMarkerEnd } from "reactflow"

export default function ParallelEdge(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY, style, markerEndId, data, id, label } = props

  const dx = targetX - sourceX
  const dy = targetY - sourceY
  const mx = (sourceX + targetX) / 2
  const my = (sourceY + targetY) / 2

  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const nx = -dy / len
  const ny = dx / len

  const index = data?.index ?? 0
  const total = data?.total ?? 1
  const spacing = data?.spacing ?? 24

  // center the offsets around 0
  const center = (total - 1) / 2
  const offset = (index - center) * spacing

  const cx = mx + nx * offset
  const cy = my + ny * offset

  const path = `M ${sourceX},${sourceY} Q ${cx},${cy} ${targetX},${targetY}`

  // label position on curve (t=0.5)
  const t = 0.5
  const lx = (1 - t) * (1 - t) * sourceX + 2 * (1 - t) * t * cx + t * t * targetX
  const ly = (1 - t) * (1 - t) * sourceY + 2 * (1 - t) * t * cy + t * t * targetY

  const angle = Math.atan2(dy, dx)
  const arrowLength = 14
  const arrowWidth = 10
  const ex = targetX
  const ey = targetY
  const bx = ex - Math.cos(angle) * arrowLength
  const by = ey - Math.sin(angle) * arrowLength
  const px = -Math.sin(angle)
  const py = Math.cos(angle)
  const half = arrowWidth / 2
  const arrowPoints = `${bx + px * half},${by + py * half} ${ex + px * half},${ey + py * half} ${ex - px * half},${ey - py * half} ${bx - px * half},${by - py * half}`

  return (
    <g>
      <path id={id} d={path} fill="none" stroke={(style as any)?.stroke || "#0f172a"} strokeWidth={(style as any)?.strokeWidth || 4} strokeLinecap="round" markerEnd={getMarkerEnd(markerEndId)} />
      <polygon points={arrowPoints} fill={(style as any)?.stroke || "#0f172a"} />
      {label && (
        <g transform={`translate(${lx}, ${ly})`}>
          <rect x={-20} y={-10} width={40} height={20} rx={8} fill="rgba(255,255,255,0.95)" />
          <text x={0} y={6} fill="#0f172a" fontFamily="ui-monospace, monospace" fontSize={12} textAnchor="middle">{label}</text>
        </g>
      )}
    </g>
  )
}
