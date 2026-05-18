"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Code2, Zap, Settings2 } from "lucide-react"
import { ParserType } from "@/lib/parser-types"

interface GrammarInputProps {
  onAction: (params: {
    parser: ParserType
    grammar: string
    tokens: string[]
    action: "build" | "parse"
  }) => void
  loading: boolean
}

const parserOptions: Array<{ value: ParserType; label: string }> = [
  { value: "ll1", label: "LL(1)" },
  { value: "lr0", label: "LR(0)" },
  { value: "slr1", label: "SLR(1)" },
  { value: "lr1", label: "LR(1)" },
  { value: "lalr1", label: "LALR(1)" },
]

export default function GrammarInput({ onAction, loading }: GrammarInputProps) {
  const [grammar, setGrammar] = useState("S -> C C\nC -> c C\nC -> d")
  const [inputString, setInputString] = useState("c d d")
  const [parser, setParser] = useState<ParserType>("lr1")

  const grammarForBackend = grammar.replace(/''/g, "ε")
  const tokens = inputString.trim().length > 0 ? inputString.trim().split(/\s+/) : []

  return (
    <Card className="p-6 sticky top-4 gradient-card glow-primary card-hover border-primary/20">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
          <Code2 className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Panel de Parser</h2>
          <p className="text-sm text-muted-foreground max-w-xl">Selecciona el tipo de parser, copia la gramática y parsea la cadena de tokens.</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        <div className="space-y-6">
          <div>
            <Label htmlFor="grammar" className="text-sm font-semibold text-foreground mb-3 block">
              Definición de Producciones
            </Label>
            <Textarea
              id="grammar"
              value={grammar}
              onChange={(e) => setGrammar(e.target.value)}
              placeholder="S -> C C&#10;C -> c C&#10;C -> d&#10;Usa '' para ε"
              aria-label="Definición de la gramática; usa dos comillas simples '' para indicar epsilon"
              className="font-mono text-sm h-40 resize-none bg-input/50 border-primary/20 focus:border-primary focus:ring-primary/30 transition-colors"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground mt-2">Usa saltos de línea para separar producciones. Usa <code>''</code> para ε.</p>
          </div>

          <div>
            <Label htmlFor="input" className="text-sm font-semibold text-foreground mb-3 block">
              Cadena de Tokens
            </Label>
            <Input
              id="input"
              value={inputString}
              onChange={(e) => setInputString(e.target.value)}
              placeholder="c d d"
              className="font-mono text-sm bg-input/50 border-accent/20 focus:border-accent focus:ring-accent/30 transition-colors"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground mt-2">Separe los tokens con espacios. Requerido solo para análisis.</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <Label htmlFor="parser" className="text-sm font-semibold text-foreground mb-3 block">
              Tipo de Parser
            </Label>
            <Select value={parser} onValueChange={(value) => setParser(value as ParserType)}>
              <SelectTrigger id="parser" aria-label="Seleccionar tipo de parser" className="w-full">
                <div className="flex items-center justify-between gap-2">
                  <span>{parser.toUpperCase()}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                {parserOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2"><Settings2 className="w-4 h-4" />{option.label}</div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-3xl border border-border/70 bg-background/80 p-5 shadow-sm shadow-slate-500/5">
            <p className="text-sm font-semibold text-foreground mb-3">Acción</p>
            <Button
              type="button"
              disabled={loading || !grammar.trim() || tokens.length === 0}
              onClick={() => onAction({ parser, grammar: grammarForBackend, tokens, action: "parse" })}
              className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90"
            >
              Parsear Cadena
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
