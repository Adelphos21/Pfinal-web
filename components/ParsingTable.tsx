"use client"

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef,
} from "@tanstack/react-table"

import { Card } from "@/components/ui/card"

import {
  ParserType,
  Tables,
} from "@/lib/parser-types"

interface ParsingTableProps {
  parser_type: ParserType
  tables: Tables
}

interface TableRow {
  state: string
  [key: string]: string | number | string[]
}

// sanitize symbol keys so "$" doesn't conflict with tanstack internals
function sanitizeKey(sym: string) {
  return sym === "$" ? "__dollar__" : sym
}

function sanitizeRow(row: Record<string, unknown>): TableRow {
  const result: TableRow = { state: "" }
  for (const [k, v] of Object.entries(row)) {
    result[sanitizeKey(k)] = v as string | number | string[]
  }
  return result
}

//
// ==========================================================
// SYMBOL SORT
// ==========================================================
//

function sortSymbols(symbols: string[]) {

  return symbols.sort((a, b) => {

    //
    // $ always last
    //

    if (a === "$") return 1
    if (b === "$") return -1

    return a.localeCompare(b)
  })
}

//
// ==========================================================
// TABLE SECTION
// ==========================================================
//

function TableSection({
  rows,
  symbols,
  title,
}: {
  rows: TableRow[]
  symbols: string[]
  title: string
}) {

  const columnHelper =
    createColumnHelper<TableRow>()

  const columns: ColumnDef<TableRow>[] = [

    //
    // state column
    //

    columnHelper.accessor("state", {

      header: () => (
        <span className="text-left">
          Estado / No terminal
        </span>
      ),

      cell: (info) => (
        <span className="font-semibold text-primary">
          {info.getValue()}
        </span>
      ),
    }),

    //
    // dynamic columns
    //

    ...symbols.map((symbol) => {

      const key = sanitizeKey(symbol)

      return columnHelper.accessor(
        (row) => row[key],
        {

          id: key,

          header: () => (
            <span className="text-left">
              {symbol}
            </span>
          ),

          cell: (info) => {

            const value =
              info.getValue()

            //
            // conflicts / multiple actions
            //

            if (Array.isArray(value)) {

              return (
                <pre className="whitespace-pre-wrap text-sm leading-5 text-foreground">
                  {
                    value.length > 0
                      ? value.join(" / ")
                      : "-"
                  }
                </pre>
              )
            }

            return (
              <span className="text-foreground">
                {
                  value === undefined
                  || value === null
                  || value === ""
                    ? "-"
                    : String(value)
                }
              </span>
            )
          },
        }
      )
    }),
  ]

  const table = useReactTable({

    data: rows,

    columns,

    getCoreRowModel:
      getCoreRowModel(),
  })

  return (

    <Card className="p-4 overflow-x-auto">

      <h3 className="text-lg font-semibold text-primary mb-3">
        {title}
      </h3>

      {
        rows.length === 0 ? (

          <p className="text-sm text-muted-foreground">
            No hay datos disponibles.
          </p>

        ) : (

          <table className="w-max min-w-full text-sm font-mono border-separate border-spacing-0">

            <thead>

              {
                table.getHeaderGroups().map(
                  (headerGroup) => (

                    <tr key={headerGroup.id}>

                      {
                        headerGroup.headers.map(
                          (header) => (

                            <th
                              key={header.id}
                              className="
                                sticky top-0
                                bg-slate-950/95
                                border border-border/80
                                px-3 py-3
                                text-left text-xs
                                tracking-[0.18em]
                                text-primary
                              "
                            >

                              {
                                header.isPlaceholder
                                  ? null
                                  : flexRender(
                                      header.column.columnDef.header,
                                      header.getContext()
                                    )
                              }

                            </th>
                          )
                        )
                      }

                    </tr>
                  )
                )
              }

            </thead>

            <tbody>

              {
                table.getRowModel().rows.map(
                  (row) => (

                    <tr
                      key={row.id}
                      className="
                        border-b
                        border-border/20
                        hover:bg-secondary/5
                      "
                    >

                      {
                        row.getVisibleCells().map(
                          (cell) => (

                            <td
                              key={cell.id}
                              className="
                                px-3 py-3
                                align-top
                                text-foreground
                                leading-tight
                              "
                            >

                              {
                                flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )
                              }

                            </td>
                          )
                        )
                      }

                    </tr>
                  )
                )
              }

            </tbody>

          </table>
        )
      }

    </Card>
  )
}

//
// ==========================================================
// MAIN COMPONENT
// ==========================================================
//

export default function ParsingTable({
  parser_type,
  tables,
}: ParsingTableProps) {

  const isLL1 =
    parser_type === "ll1"

  //
  // tables
  //

  const actionTable =
    tables.action_table || {}

  const gotoTable =
    tables.goto_table || {}

  const ll1Table =
    tables.ll1_table || {}

  //
  // symbols
  //

  const actionSymbols = sortSymbols(

    Array.from(

      new Set(

        Object.values(actionTable).flatMap(
          (row) => Object.keys(row)
        )
      )
    )
  )

  const gotoSymbols = sortSymbols(

    Array.from(

      new Set(

        Object.values(gotoTable).flatMap(
          (row) => Object.keys(row)
        )
      )
    )
  )

  const ll1Symbols = sortSymbols(

    Array.from(

      new Set(

        Object.values(ll1Table).flatMap(
          (row) => Object.keys(row)
        )
      )
    )
  )

  //
  // rows
  //

  const actionRows: TableRow[] =

    Object.entries(actionTable).map(
      ([state, row]) => ({
        ...sanitizeRow(row as Record<string, unknown>),
        state,
      })
    )

  const gotoRows: TableRow[] =

    Object.entries(gotoTable).map(
      ([state, row]) => ({
        ...sanitizeRow(row as Record<string, unknown>),
        state,
      })
    )

  const ll1Rows: TableRow[] =

    Object.entries(ll1Table).map(
      ([nonterminal, row]) => ({
        ...sanitizeRow(row as Record<string, unknown>),
        state: nonterminal,
      })
    )

  return (

    <div className="space-y-4">

      {
        isLL1 ? (

          <TableSection
            rows={ll1Rows}
            symbols={ll1Symbols}
            title="Tabla LL(1)"
          />

        ) : (

          <div className="grid gap-4">

            <TableSection
              rows={actionRows}
              symbols={actionSymbols}
              title="Tabla de Acción"
            />

            <TableSection
              rows={gotoRows}
              symbols={gotoSymbols}
              title="Tabla GOTO"
            />

          </div>
        )
      }

    </div>
  )
}