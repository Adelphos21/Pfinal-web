"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface StatesSectionProps {
  data: any
}

export default function StatesSection({ data }: StatesSectionProps) {
  const [searchState, setSearchState] = useState("")

  const states = data.states || {}
  const filteredStates = Object.entries(states).filter(([key]) => key.toLowerCase().includes(searchState.toLowerCase()))

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar estado (ej: I0, I1)..."
          value={searchState}
          onChange={(e) => setSearchState(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4">
        {filteredStates.map(([stateKey, items]: [string, any]) => (
          <Card key={stateKey} className="p-4">
            <h4 className="font-mono font-bold text-primary mb-3">{stateKey}</h4>
            <div className="space-y-1">
              {items.map((item: string, idx: number) => (
                <div key={idx} className="font-mono text-xs p-2 bg-secondary/10 rounded text-foreground/80">
                  {item}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {filteredStates.length === 0 && (
        <Card className="p-4 text-center text-muted-foreground">No se encontraron estados</Card>
      )}
    </div>
  )
}
