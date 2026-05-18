import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ParserGrammar } from "@/lib/parser-types"

interface GrammarPanelProps {
  grammar: ParserGrammar
}

export default function GrammarPanel({ grammar }: GrammarPanelProps) {
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4 gap-4">
          <div>
            <h3 className="text-lg font-semibold text-primary">Gramática</h3>
            <p className="text-sm text-muted-foreground">Símbolo inicial: <span className="font-semibold text-foreground">{grammar.start_symbol || "-"}</span></p>
          </div>
          <Badge className="bg-secondary/30 text-secondary-foreground">Producciones {grammar.productions?.length ?? 0}</Badge>
        </div>
        <div className="grid gap-2">
          {grammar.productions.map((production, index) => (
            <div key={index} className="rounded-md border border-border/50 bg-secondary/10 px-3 py-2 font-mono text-sm text-foreground/90">
              {production}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h4 className="text-sm font-semibold text-primary mb-3">Terminales</h4>
          <div className="flex flex-wrap gap-2">
            {grammar.terminals.length > 0 ? (
              grammar.terminals.map((term, index) => (
                <Badge key={index} className="bg-accent/10 text-accent font-mono">{term}</Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No hay terminales</p>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <h4 className="text-sm font-semibold text-primary mb-3">No terminales</h4>
          <div className="flex flex-wrap gap-2">
            {grammar.non_terminals.length > 0 ? (
              grammar.non_terminals.map((nt, index) => (
                <Badge key={index} className="bg-secondary/10 text-foreground font-mono">{nt}</Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No hay no terminales</p>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <h4 className="text-sm font-semibold text-primary mb-3">Resumen</h4>
          <div className="space-y-2 text-sm text-foreground/90">
            <div className="flex items-center justify-between">
              <span>Producciones</span>
              <span className="font-semibold">{grammar.productions.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Terminales</span>
              <span className="font-semibold">{grammar.terminals.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>No terminales</span>
              <span className="font-semibold">{grammar.non_terminals.length}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
