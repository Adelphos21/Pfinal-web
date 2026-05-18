import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface GrammarSectionProps {
  data: any
}

export default function GrammarSection({ data }: GrammarSectionProps) {
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Producciones</h3>
        <div className="space-y-2">
          {data.grammar?.map((prod: string, idx: number) => (
            <div key={idx} className="font-mono text-sm p-2 bg-secondary/10 rounded border border-border">
              {prod}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <h4 className="font-semibold text-primary mb-3">Terminales</h4>
          <div className="flex flex-wrap gap-2">
            {data.terminals?.map((term: string, idx: number) => (
              <Badge key={idx} variant="secondary" className="bg-accent/20 text-accent">
                {term}
              </Badge>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h4 className="font-semibold text-primary mb-3">No Terminales</h4>
          <div className="flex flex-wrap gap-2">
            {data.non_terminals?.map((nt: string, idx: number) => (
              <Badge key={idx} variant="outline" className="border-primary/30 text-primary">
                {nt}
              </Badge>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
