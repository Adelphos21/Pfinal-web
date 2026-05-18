"use client"

import { Card } from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

interface TablesSectionProps {
  data: any
}

export default function TablesSection({
  data,
}: TablesSectionProps) {

  //
  // TABLES
  //

  const actionTable =
    data.action_table || {}

  const gotoTable =
    data.goto_table || {}

  const ll1Table =
    data.ll1_table || {}

  //
  // DETECT LL1
  //

  const isLL1 =
    Object.keys(ll1Table).length > 0

  //
  // SYMBOLS FROM BACKEND
  //

  const actionSymbols =
    data?.grammar?.terminals || []

  const gotoSymbols =
    data?.grammar?.non_terminals || []

  const ll1Symbols =
    data?.grammar?.terminals || []

  return (

    <Tabs
      defaultValue="main"
      className="w-full"
    >

      <TabsList
        className={
          isLL1
            ? "grid w-full grid-cols-1 bg-secondary/20"
            : "grid w-full grid-cols-2 bg-secondary/20"
        }
      >

        <TabsTrigger value="main">
          {isLL1
            ? "Tabla LL(1)"
            : "Tabla de Acción"}
        </TabsTrigger>

        {
          !isLL1 && (

            <TabsTrigger value="goto">
              Tabla GOTO
            </TabsTrigger>
          )
        }

      </TabsList>

      {/* MAIN TABLE */}

      <TabsContent value="main">

        <Card className="p-4 overflow-x-auto">

          <table className="w-full text-sm font-mono">

            <thead>

              <tr className="border-b border-border">

                <th className="text-left p-2 bg-primary/10 text-primary font-semibold">
                  Estado / No terminal
                </th>

                {
                  (
                    isLL1
                      ? ll1Symbols
                      : actionSymbols
                  ).map((symbol: string) => (

                    <th
                      key={symbol}
                      className="text-left p-2 bg-primary/10 text-primary font-semibold"
                    >
                      {symbol}
                    </th>
                  ))
                }

              </tr>

            </thead>

            <tbody>

              {
                Object.entries(
                  isLL1
                    ? ll1Table
                    : actionTable
                ).map(
                  ([state, row]: [string, any]) => (

                    <tr
                      key={state}
                      className="border-b border-border/50 hover:bg-secondary/5"
                    >

                      <td className="p-2 font-bold text-primary">
                        {state}
                      </td>

                      {
                        (
                          isLL1
                            ? ll1Symbols
                            : actionSymbols
                        ).map((symbol: string) => (

                          <td
                            key={symbol}
                            className="p-2 text-accent"
                          >

                            {
                              row[symbol]
                                ? Array.isArray(row[symbol])
                                  ? row[symbol].join(" / ")
                                  : row[symbol]
                                : "-"
                            }

                          </td>
                        ))
                      }

                    </tr>
                  )
                )
              }

            </tbody>

          </table>

        </Card>

      </TabsContent>

      {/* GOTO TABLE */}

      {
        !isLL1 && (

          <TabsContent value="goto">

            <Card className="p-4 overflow-x-auto">

              <table className="w-full text-sm font-mono">

                <thead>

                  <tr className="border-b border-border">

                    <th className="text-left p-2 bg-primary/10 text-primary font-semibold">
                      Estado
                    </th>

                    {
                      gotoSymbols.map((symbol: string) => (

                        <th
                          key={symbol}
                          className="text-left p-2 bg-primary/10 text-primary font-semibold"
                        >
                          {symbol}
                        </th>

                      ))
                    }

                  </tr>

                </thead>

                <tbody>

                  {
                    Object.entries(gotoTable).map(
                      ([state, row]: [string, any]) => (

                        <tr
                          key={state}
                          className="border-b border-border/50 hover:bg-secondary/5"
                        >

                          <td className="p-2 font-bold text-primary">
                            {state}
                          </td>

                          {
                            gotoSymbols.map((symbol: string) => (

                              <td
                                key={symbol}
                                className="p-2 text-accent"
                              >
                                {row[symbol] ?? "-"}
                              </td>

                            ))
                          }

                        </tr>
                      )
                    )
                  }

                </tbody>

              </table>

            </Card>

          </TabsContent>
        )
      }

    </Tabs>
  )
}