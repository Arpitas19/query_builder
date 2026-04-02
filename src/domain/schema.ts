export type TableName = 'users' | 'orders' | 'products' | 'events'

export type ColumnType = 'number' | 'string' | 'boolean' | 'date'

export interface ColumnDefinition {
  name: string
  type: ColumnType
}

export type TableSchema = Record<TableName, ColumnDefinition[]>

export const SCHEMA: TableSchema = {
  users: [
    { name: 'id', type: 'number' },
    { name: 'name', type: 'string' },
    { name: 'email', type: 'string' },
    { name: 'country', type: 'string' },
    { name: 'created_at', type: 'date' },
    { name: 'is_active', type: 'boolean' },
  ],
  orders: [
    { name: 'id', type: 'number' },
    { name: 'user_id', type: 'number' },
    { name: 'product_id', type: 'number' },
    { name: 'quantity', type: 'number' },
    { name: 'total_price', type: 'number' },
    { name: 'status', type: 'string' },
    { name: 'ordered_at', type: 'date' },
  ],
  products: [
    { name: 'id', type: 'number' },
    { name: 'name', type: 'string' },
    { name: 'category', type: 'string' },
    { name: 'price', type: 'number' },
    { name: 'stock', type: 'number' },
    { name: 'rating', type: 'number' },
  ],
  events: [
    { name: 'id', type: 'number' },
    { name: 'user_id', type: 'number' },
    { name: 'event_type', type: 'string' },
    { name: 'page', type: 'string' },
    { name: 'occurred_at', type: 'date' },
    { name: 'session_id', type: 'string' },
  ],
}

export function getTableColumns(table: TableName): ColumnDefinition[] {
  return SCHEMA[table]
}

export function getColumnType(table: TableName, column: string): ColumnType | undefined {
  return SCHEMA[table].find((candidate) => candidate.name === column)?.type
}
