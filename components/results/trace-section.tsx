import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TraceSectionProps {
  data: any
}

export default function TraceSection({ data }: TraceSectionProps) {
  const trace = data.trace || []

  return (
    <div className="space-y-3">
      {trace.map((step: any, idx: number) => (
        <Card key={idx} className="p-4 border-l-4 border-l-primary">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground font-semibold mb-1">Stack</p>
              <p className="font-mono text-foreground">{step.stack}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold mb-1">Input</p>
              <p className="font-mono text-foreground">{step.input}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold mb-1">Acción</p>
              <Badge className="bg-accent/20 text-accent font-mono">{step.action}</Badge>
            </div>
          </div>
        </Card>
      ))}

      {trace.length === 0 && <Card className="p-4 text-center text-muted-foreground">No hay traza disponible</Card>}
    </div>
  )
}
