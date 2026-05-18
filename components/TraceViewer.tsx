"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, ArrowRight, ArrowLeft } from "lucide-react"
import { ParseResult } from "@/lib/parser-types"

interface TraceViewerProps {
  parse_result: ParseResult | null
}

export default function TraceViewer({ parse_result }: TraceViewerProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const trace = useMemo(() => parse_result?.trace || [], [parse_result])

  useEffect(() => {
    if (!isPlaying || trace.length === 0) return
    const interval = window.setInterval(() => {
      setCurrentStep((current) => {
        if (current + 1 >= trace.length) {
          window.clearInterval(interval)
          setIsPlaying(false)
          return current
        }
        return current + 1
      })
    }, 1200)
    return () => window.clearInterval(interval)
  }, [isPlaying, trace.length])

  useEffect(() => {
    if (currentStep >= trace.length) {
      setCurrentStep(Math.max(0, trace.length - 1))
    }
  }, [trace.length, currentStep])

  if (!parse_result) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-primary mb-3">Traza</h3>
        <p className="text-sm text-muted-foreground">Construye el parser y parsea una cadena para ver la traza paso a paso.</p>
      </Card>
    )
  }

  const current = trace[currentStep]

  return (
      <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-primary">Traza de Análisis</h3>
            <p className="text-sm text-muted-foreground">Navega entre los pasos del parser.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))} disabled={currentStep === 0}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Anterior
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setCurrentStep((prev) => Math.min(trace.length - 1, prev + 1))} disabled={currentStep >= trace.length - 1}>
              Siguiente <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setIsPlaying((value) => !value)} disabled={trace.length === 0}>
              {isPlaying ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
              {isPlaying ? "Pausar" : "Autoplay"}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-4 overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm font-mono border-separate border-spacing-0">
          <thead>
            <tr className="bg-primary/10 text-left text-xs uppercase tracking-[0.18em] text-primary">
              <th className="p-3 border border-border">#</th>
              <th className="p-3 border border-border">Pila</th>
              <th className="p-3 border border-border">Entrada</th>
              <th className="p-3 border border-border">Acción</th>
            </tr>
          </thead>
          <tbody>
            {trace.map((step, index) => (
              <tr key={index} className={index === currentStep ? "bg-primary/10" : "hover:bg-secondary/5"}>
                <td className="p-3 text-primary font-semibold">{index + 1}</td>
                <td className="p-3 text-foreground whitespace-pre-wrap">{step.stack_display}</td>
                <td className="p-3 text-foreground whitespace-pre-wrap">{step.input_display}</td>
                <td className="p-3 text-foreground whitespace-pre-wrap">{step.action_display || step.action || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {parse_result.error && (
        <Card className="p-4 border border-destructive/20 bg-destructive/5 text-destructive">
          <p className="text-sm">Error de parseo: {parse_result.error}</p>
        </Card>
      )}
    </div>
  )
}
