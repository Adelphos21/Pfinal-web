export type ParserType = "ll1" | "lr0" | "slr1" | "lr1" | "lalr1"

export interface ParserGrammar {
  productions: string[]
  terminals: string[]
  non_terminals: string[]
  start_symbol: string
}

export interface AutomatonState {
  id: number
  label: string
  items: string[]
  is_initial: boolean
  is_accepting: boolean
}

export interface AutomatonTransition {
  source: number
  target: number
  symbol: string
}

export interface Automaton {
  states: AutomatonState[]
  transitions: AutomatonTransition[]
}

export interface Tables {
  action_table: Record<string, Record<string, string[]>>
  goto_table: Record<string, Record<string, number>>
  ll1_table: Record<string, Record<string, string[]>>
}

export interface ParseTraceStep {
  stack: unknown[]
  stack_display: string
  input: unknown[]
  input_display: string
  action: string
  action_display: string
}

export interface SyntaxTreeNode {
  symbol: string
  children: SyntaxTreeNode[]
}

export interface ParseResult {
  accepted: boolean
  error: string | null
  trace: ParseTraceStep[]
  syntax_tree: SyntaxTreeNode | null
}

export type ConflictEntry = string

export interface ParserStatistics {
  num_states: number
  is_valid: boolean
}

export interface ParserResponseBase {
  parser_type: ParserType
  grammar: ParserGrammar
  automata: {
    nfa: Automaton
    dfa: Automaton
  }
  tables: Tables
  first_sets: Record<string, string[]>
  follow_sets: Record<string, string[]>
  conflicts: ConflictEntry[]
  statistics: ParserStatistics
}

export interface ParserBuildResponse extends ParserResponseBase {}

export interface ParserParseResponse extends ParserResponseBase {
  parse_result: ParseResult
}
