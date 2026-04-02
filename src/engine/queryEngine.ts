import { type DataSet, getRowsByTable, type GenericRow, type RowValue } from '../domain/dataset'
import { type QueryDraft, type WhereCondition } from '../domain/query'
import { getColumnType, getTableColumns } from '../domain/schema'

function compareValues(left: RowValue, right: RowValue): number {
  if (typeof left === 'number' && typeof right === 'number') {
    return left - right
  }

  const leftDate = Date.parse(String(left))
  const rightDate = Date.parse(String(right))
  if (!Number.isNaN(leftDate) && !Number.isNaN(rightDate)) {
    return leftDate - rightDate
  }

  return String(left).localeCompare(String(right), undefined, { sensitivity: 'base' })
}

function toTypedValue(raw: string, rowValue: RowValue): RowValue {
  if (typeof rowValue === 'number') {
    const numeric = Number(raw)
    return Number.isFinite(numeric) ? numeric : 0
  }

  if (typeof rowValue === 'boolean') {
    return raw.toLowerCase() === 'true'
  }

  return raw
}

function evaluateCondition(row: GenericRow, condition: WhereCondition): boolean {
  const rowValue = row[condition.column]
  if (rowValue === undefined) {
    return false
  }

  const typed = toTypedValue(condition.value, rowValue)

  switch (condition.operator) {
    case '=':
      return compareValues(rowValue, typed) === 0
    case '!=':
      return compareValues(rowValue, typed) !== 0
    case '>':
      return compareValues(rowValue, typed) > 0
    case '<':
      return compareValues(rowValue, typed) < 0
    case '>=':
      return compareValues(rowValue, typed) >= 0
    case '<=':
      return compareValues(rowValue, typed) <= 0
    case 'CONTAINS':
      return String(rowValue).toLowerCase().includes(String(typed).toLowerCase())
    default:
      return false
  }
}

function applyWhere(rows: GenericRow[], draft: QueryDraft): GenericRow[] {
  if (draft.conditions.length === 0) {
    return rows
  }

  return rows.filter((row) => {
    let decision = evaluateCondition(row, draft.conditions[0])

    for (let index = 1; index < draft.conditions.length; index += 1) {
      const condition = draft.conditions[index]
      const next = evaluateCondition(row, condition)
      decision = condition.joinWithPrevious === 'OR' ? decision || next : decision && next
    }

    return decision
  })
}

function applyOrder(rows: GenericRow[], draft: QueryDraft): GenericRow[] {
  if (!draft.orderBy) {
    return rows
  }

  const multiplier = draft.orderBy.direction === 'ASC' ? 1 : -1
  const column = draft.orderBy.column
  return [...rows].sort((a, b) => compareValues(a[column], b[column]) * multiplier)
}

function applyProjection(rows: GenericRow[], draft: QueryDraft): { rows: GenericRow[]; columns: string[] } {
  const allColumns = getTableColumns(draft.sourceTable).map((column) => column.name)
  const columns = draft.selectColumns.length > 0 ? draft.selectColumns : allColumns

  return {
    columns,
    rows: rows.map((row) => {
      const projected: GenericRow = {}
      for (const column of columns) {
        projected[column] = row[column]
      }
      return projected
    }),
  }
}

export interface QueryResult {
  rows: GenericRow[]
  columns: string[]
  totalRows: number
}

export function executeQuery(data: DataSet, draft: QueryDraft): QueryResult {
  const source = getRowsByTable(data, draft.sourceTable)
  const filtered = applyWhere(source, draft)
  const ordered = applyOrder(filtered, draft)
  const limited = ordered.slice(0, Math.max(1, draft.limit))
  const projected = applyProjection(limited, draft)

  return {
    rows: projected.rows,
    columns: projected.columns,
    totalRows: filtered.length,
  }
}

export function getDefaultConditionValue(table: QueryDraft['sourceTable'], column: string): string {
  const type = getColumnType(table, column)
  if (type === 'number') {
    return '0'
  }

  if (type === 'boolean') {
    return 'true'
  }

  return ''
}
