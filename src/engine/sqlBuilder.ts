import { type QueryDraft, type WhereCondition } from '../domain/query'
import { getColumnType } from '../domain/schema'

function quote(value: string): string {
  return `'${value.replace(/'/g, "''")}'`
}

function renderCondition(table: QueryDraft['sourceTable'], condition: WhereCondition): string {
  const columnType = getColumnType(table, condition.column)
  const col = `"${condition.column}"`

  if (condition.operator === 'CONTAINS') {
    return `${col} LIKE ${quote(`%${condition.value}%`)}`
  }

  if (columnType === 'number') {
    return `${col} ${condition.operator} ${Number(condition.value) || 0}`
  }

  if (columnType === 'boolean') {
    return `${col} ${condition.operator} ${condition.value.toLowerCase() === 'true' ? 'true' : 'false'}`
  }

  return `${col} ${condition.operator} ${quote(condition.value)}`
}

export function toSql(draft: QueryDraft): string {
  const selectClause = draft.selectColumns.length > 0 ? draft.selectColumns.map((c) => `"${c}"`).join(', ') : '*'
  const fromClause = `FROM "${draft.sourceTable}"`

  const whereClause =
    draft.conditions.length === 0
      ? ''
      : `WHERE ${draft.conditions
          .map((condition, index) => {
            const conditionSql = renderCondition(draft.sourceTable, condition)
            if (index === 0) {
              return `(${conditionSql})`
            }
            return `${condition.joinWithPrevious ?? 'AND'} (${conditionSql})`
          })
          .join(' ')}`

  const orderClause = draft.orderBy
    ? `ORDER BY "${draft.orderBy.column}" ${draft.orderBy.direction}`
    : ''

  const limitClause = `LIMIT ${Math.max(1, draft.limit)}`

  return ['SELECT ' + selectClause, fromClause, whereClause, orderClause, limitClause]
    .filter((part) => part.length > 0)
    .join('\n')
}
