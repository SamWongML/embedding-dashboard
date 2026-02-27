import type { TraceSummary } from '@/lib/schemas/server-status'

export type TraceSearchTokenKey =
  | 'status'
  | 'service'
  | 'method'
  | 'route'
  | 'trace'
  | 'duration'
  | 'spans'

type TraceNumericOperator = 'gt' | 'gte' | 'lt' | 'lte' | 'eq'

export interface TraceNumericPredicate {
  operator: TraceNumericOperator
  value: number
}

interface TraceSearchStatusToken {
  kind: 'status'
  value: TraceSummary['status']
}

interface TraceSearchTextToken {
  kind: 'service' | 'method' | 'route' | 'trace'
  value: string
}

interface TraceSearchDurationToken {
  kind: 'duration'
  predicate: TraceNumericPredicate
}

interface TraceSearchSpansToken {
  kind: 'spans'
  predicate: TraceNumericPredicate
}

type ParsedTraceSearchToken =
  | TraceSearchStatusToken
  | TraceSearchTextToken
  | TraceSearchDurationToken
  | TraceSearchSpansToken

export interface ParsedTraceSearchQuery {
  raw: string
  tokens: ParsedTraceSearchToken[]
  terms: string[]
}

const STATUS_ALIASES: Record<string, TraceSummary['status']> = {
  ok: 'ok',
  success: 'ok',
  healthy: 'ok',
  error: 'error',
  err: 'error',
  failed: 'error',
  fail: 'error',
}

const OPERATOR_ALIASES: Record<string, TraceNumericOperator> = {
  '>': 'gt',
  '>=': 'gte',
  '<': 'lt',
  '<=': 'lte',
  '=': 'eq',
}

const TOKEN_PATTERN = /"[^"]+"|'[^']+'|\S+/g

function normalize(value: string) {
  return value.trim().toLowerCase()
}

function stripQuotes(value: string) {
  if (value.length < 2) return value
  const startsWithDoubleQuote = value.startsWith('"') && value.endsWith('"')
  const startsWithSingleQuote = value.startsWith("'") && value.endsWith("'")

  if (startsWithDoubleQuote || startsWithSingleQuote) {
    return value.slice(1, -1)
  }

  return value
}

function parseNumericPredicate(input: string, allowDurationUnits: boolean) {
  const pattern = allowDurationUnits
    ? /^(<=|>=|=|<|>)?\s*(-?\d+(?:\.\d+)?)\s*(ms|s)?$/i
    : /^(<=|>=|=|<|>)?\s*(-?\d+(?:\.\d+)?)$/i

  const match = input.match(pattern)
  if (!match) return null

  const [, rawOperator, rawValue, rawUnit] = match
  const numeric = Number(rawValue)

  if (!Number.isFinite(numeric)) return null

  const operator = OPERATOR_ALIASES[rawOperator ?? '=']
  const unit = rawUnit?.toLowerCase()
  const multiplier = unit === 's' ? 1000 : 1

  return {
    operator,
    value: numeric * multiplier,
  } satisfies TraceNumericPredicate
}

function evaluateNumericPredicate(value: number, predicate: TraceNumericPredicate) {
  switch (predicate.operator) {
    case 'gt':
      return value > predicate.value
    case 'gte':
      return value >= predicate.value
    case 'lt':
      return value < predicate.value
    case 'lte':
      return value <= predicate.value
    case 'eq':
    default:
      return value === predicate.value
  }
}

function tokenizeSearchQuery(input: string) {
  return input.match(TOKEN_PATTERN) ?? []
}

function parseTokenTerm(term: string): ParsedTraceSearchToken | null {
  const separatorIndex = term.indexOf(':')
  if (separatorIndex <= 0) return null

  const key = normalize(term.slice(0, separatorIndex))
  const rawValue = stripQuotes(term.slice(separatorIndex + 1))
  const normalizedValue = normalize(rawValue)
  if (!normalizedValue) return null

  switch (key) {
    case 'status': {
      const mappedStatus = STATUS_ALIASES[normalizedValue]
      return mappedStatus ? { kind: 'status', value: mappedStatus } : null
    }
    case 'service':
    case 'method':
    case 'route':
    case 'trace':
      return { kind: key, value: normalizedValue }
    case 'duration': {
      const predicate = parseNumericPredicate(normalizedValue, true)
      return predicate ? { kind: 'duration', predicate } : null
    }
    case 'spans': {
      const predicate = parseNumericPredicate(normalizedValue, false)
      return predicate ? { kind: 'spans', predicate } : null
    }
    default:
      return null
  }
}

function buildStatusSearchAliases(status: TraceSummary['status']) {
  if (status === 'error') {
    return 'error failed fail'
  }

  return 'ok success healthy'
}

function buildDurationSearchAliases(durationMs: number) {
  const roundedMs = Math.round(durationMs)
  const roundedMsLocale = roundedMs.toLocaleString('en-US')
  const seconds = Number((durationMs / 1000).toFixed(3))
  return `${durationMs} ${roundedMs} ${roundedMsLocale} ${roundedMs}ms ${roundedMsLocale}ms ${seconds}s`
}

export function buildTraceSearchIndex(trace: TraceSummary, localeTimeString = '') {
  const spanCountLocale = trace.spanCount.toLocaleString('en-US')
  return normalize(
    [
      trace.status,
      buildStatusSearchAliases(trace.status),
      trace.traceId,
      trace.id,
      trace.method,
      trace.route,
      trace.service,
      buildDurationSearchAliases(trace.durationMs),
      trace.spanCount,
      spanCountLocale,
      `${trace.spanCount} spans`,
      `${spanCountLocale} spans`,
      trace.timestamp,
      localeTimeString,
    ].join(' ')
  )
}

export function parseTraceSearchQuery(input: string): ParsedTraceSearchQuery {
  const raw = input.trim()
  if (!raw) {
    return {
      raw,
      tokens: [],
      terms: [],
    }
  }

  const tokens: ParsedTraceSearchToken[] = []
  const terms: string[] = []

  for (const rawTerm of tokenizeSearchQuery(raw)) {
    const normalizedTerm = normalize(stripQuotes(rawTerm))
    if (!normalizedTerm) continue

    const parsedToken = parseTokenTerm(normalizedTerm)
    if (parsedToken) {
      tokens.push(parsedToken)
      continue
    }

    terms.push(normalizedTerm)
  }

  return {
    raw,
    tokens,
    terms,
  }
}

export function matchesTraceSearch(
  trace: TraceSummary,
  parsed: ParsedTraceSearchQuery,
  localeTimeString = ''
) {
  if (!parsed.raw) return true

  const searchIndex = buildTraceSearchIndex(trace, localeTimeString)

  for (const token of parsed.tokens) {
    switch (token.kind) {
      case 'status':
        if (trace.status !== token.value) return false
        break
      case 'service':
        if (!normalize(trace.service).includes(token.value)) return false
        break
      case 'method':
        if (!normalize(trace.method).includes(token.value)) return false
        break
      case 'route':
        if (!normalize(trace.route).includes(token.value)) return false
        break
      case 'trace':
        if (!normalize(trace.traceId).includes(token.value)) return false
        break
      case 'duration':
        if (!evaluateNumericPredicate(trace.durationMs, token.predicate)) return false
        break
      case 'spans':
        if (!evaluateNumericPredicate(trace.spanCount, token.predicate)) return false
        break
      default:
        return false
    }
  }

  for (const term of parsed.terms) {
    if (!searchIndex.includes(term)) return false
  }

  return true
}
