import { Card } from "@/components/ui/card"
import { ParserResponseBase } from "@/lib/parser-types"

interface FirstFollowTableProps {
  first_sets: ParserResponseBase["first_sets"]
  follow_sets: ParserResponseBase["follow_sets"]
}

export default function FirstFollowTable({ first_sets, follow_sets }: FirstFollowTableProps) {
  const symbols = Array.from(
    new Set([...Object.keys(first_sets || {}), ...Object.keys(follow_sets || {})]).values()
  ).sort()

  return (
    <Card className="p-4 overflow-x-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-primary">FIRST / FOLLOW</h3>
          <p className="text-sm text-muted-foreground">Conjuntos FIRST y FOLLOW para cada símbolo de la gramática.</p>
        </div>
      </div>
      <table className="w-full min-w-[540px] border-separate border-spacing-0 text-sm font-mono">
        <thead>
          <tr className="bg-primary/10 text-left text-xs uppercase tracking-[0.18em] text-primary">
            <th className="p-3 border border-border">Símbolo</th>
            <th className="p-3 border border-border">FIRST</th>
            <th className="p-3 border border-border">FOLLOW</th>
          </tr>
        </thead>
        <tbody>
          {symbols.map((symbol) => (
            <tr key={symbol} className="border-b border-border/10 hover:bg-secondary/5">
              <td className="p-3 text-foreground font-semibold">{symbol}</td>
              <td className="p-3 text-accent">{(first_sets[symbol] || []).join(", ") || "-"}</td>
              <td className="p-3 text-accent">{(follow_sets[symbol] || []).join(", ") || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {symbols.length === 0 && <p className="text-sm text-muted-foreground">No hay conjuntos FIRST/FOLLOW disponibles.</p>}
    </Card>
  )
}
