import { type TableName } from './schema'

export type ConditionOperator = '=' | '!=' | '>' | '<' | '>=' | '<=' | 'CONTAINS'
export type LogicJoin = 'AND' | 'OR'
export type SortDirection = 'ASC' | 'DESC'

export interface WhereCondition {
  id: string
  column: string
  operator: ConditionOperator
  value: string
  joinWithPrevious?: LogicJoin
}

export interface OrderByConfig {
  column: string
  direction: SortDirection
}

export interface QueryDraft {
  sourceTable: TableName
  selectColumns: string[]
  conditions: WhereCondition[]
  orderBy: OrderByConfig | null
  limit: number
}

export interface StoredQuery {
  id: string
  createdAt: string
  draft: QueryDraft
  sql: string
}

export function createDefaultQueryDraft(): QueryDraft {
  return {
    sourceTable: 'users',
    selectColumns: [],
    conditions: [],
    orderBy: null,
    limit: 100,
  }
}
