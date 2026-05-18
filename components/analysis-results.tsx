"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import GrammarPanel from "@/components/GrammarPanel"
import AutomatonGraph from "@/components/AutomatonGraph"
import ParsingTable from "@/components/ParsingTable"
import TraceViewer from "@/components/TraceViewer"
import SyntaxTreeGraph from "@/components/SyntaxTreeGraph"
import ConflictPanel from "@/components/ConflictPanel"
import { Card } from "@/components/ui/card"
import { ParserBuildResponse, ParserParseResponse } from "@/lib/parser-types"

interface AnalysisResultsProps {
  data: ParserBuildResponse | ParserParseResponse
}

function isParseResponse(data: any): data is ParserParseResponse {
  return data && typeof data.parse_result !== "undefined"
}

export default function AnalysisResults({ data }: AnalysisResultsProps) {
  const parserType = data.parser_type
  const hasDFA = data.automata?.dfa?.states?.length > 0
  const hasNFA = data.automata?.nfa?.states?.length > 0
  const showDFA = parserType !== "ll1" && hasDFA
  const showNFA = parserType !== "ll1" && hasNFA
  const hasTrace = isParseResponse(data) && data.parse_result.trace.length > 0
  const hasSyntaxTree = isParseResponse(data) && Boolean(data.parse_result.syntax_tree)
  const accepted = isParseResponse(data) ? data.parse_result.accepted : null

  return (
    <div className="space-y-6">
      <Card className="p-4 border border-border/30 bg-secondary/10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Resumen del parser</p>
            <h2 className="text-2xl font-semibold text-foreground">{parserType.toUpperCase()}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Estados {data.statistics.num_states}</span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${data.statistics.is_valid ? "bg-emerald-500/10 text-emerald-300" : "bg-destructive/10 text-destructive"}`}>
              {data.statistics.is_valid ? "Válido" : "No válido"}
            </span>
            {accepted !== null ? (
              <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${accepted ? "bg-emerald-500/10 text-emerald-300" : "bg-destructive/10 text-destructive"}`}>
                {accepted ? "Cadena aceptada" : "Cadena rechazada"}
              </span>
            ) : null}
          </div>
        </div>
      </Card>

      <Tabs defaultValue="grammar" className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 bg-secondary/20">
          <TabsTrigger value="grammar">Gramática</TabsTrigger>
          {showDFA && <TabsTrigger value="dfa">DFA</TabsTrigger>}
          {showNFA && <TabsTrigger value="nfa">NFA</TabsTrigger>}
          <TabsTrigger value="tables">Tablas</TabsTrigger>
          <TabsTrigger value="trace">Traza</TabsTrigger>
          <TabsTrigger value="syntax">Árbol</TabsTrigger>
          <TabsTrigger value="conflicts">Conflictos</TabsTrigger>
        </TabsList>

        <TabsContent value="grammar" className="space-y-4">
          <GrammarPanel grammar={data.grammar} />
        </TabsContent>

        {showDFA && (
          <TabsContent value="dfa" className="space-y-4">
            <AutomatonGraph title="DFA" automaton={data.automata.dfa} parser_type={parserType} />
          </TabsContent>
        )}

        {showNFA && (
          <TabsContent value="nfa" className="space-y-4">
            <AutomatonGraph title="NFA" automaton={data.automata.nfa} parser_type={parserType} />
          </TabsContent>
        )}

        <TabsContent value="tables" className="space-y-4">
          <ParsingTable parser_type={parserType} tables={data.tables} />
        </TabsContent>

        <TabsContent value="trace" className="space-y-4">
          <TraceViewer parse_result={isParseResponse(data) ? data.parse_result : null} />
        </TabsContent>

        <TabsContent value="syntax" className="space-y-4">
          <SyntaxTreeGraph syntax_tree={isParseResponse(data) ? data.parse_result.syntax_tree : null} />
        </TabsContent>

        <TabsContent value="conflicts" className="space-y-4">
          <ConflictPanel conflicts={data.conflicts} statistics={data.statistics} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
