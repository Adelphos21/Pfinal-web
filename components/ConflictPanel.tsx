import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ParserResponseBase } from "@/lib/parser-types"

interface ConflictPanelProps {
  conflicts: ParserResponseBase["conflicts"]
  statistics: ParserResponseBase["statistics"]
}

export default function ConflictPanel({ conflicts, statistics }: ConflictPanelProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-primary">Conflictos</h3>
          <p className="text-sm text-muted-foreground">Despliega los conflictos de análisis que el parser detectó.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-secondary/10 text-secondary">Estados {statistics.num_states}</Badge>
          <Badge className={statistics.is_valid ? "bg-emerald-500/10 text-emerald-300" : "bg-rose-500/10 text-rose-300"}>
            {statistics.is_valid ? "Válido" : "No válido"}
          </Badge>
        </div>
      </div>

      {conflicts.length === 0 ? (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 text-foreground/90">
          <p className="text-sm font-semibold text-emerald-300">Sin conflictos.</p>
          <p className="mt-2 text-sm text-muted-foreground">El parser se construyó correctamente para el tipo seleccionado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {conflicts.map((conflict, index) => (
            <div
              key={index}
              className="rounded-xl border border-border/50 bg-secondary/10 p-4"
            >
              <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-primary">
                <Badge className="bg-destructive/10 text-destructive">
                  Conflicto
                </Badge>
              </div>

              <p className="mt-2 text-sm text-foreground/90">
                {conflict}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
