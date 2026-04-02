import { type TableName } from './schema'

export interface UserRow {
  id: number
  name: string
  email: string
  country: string
  created_at: string
  is_active: boolean
}

export interface OrderRow {
  id: number
  user_id: number
  product_id: number
  quantity: number
  total_price: number
  status: string
  ordered_at: string
}

export interface ProductRow {
  id: number
  name: string
  category: string
  price: number
  stock: number
  rating: number
}

export interface EventRow {
  id: number
  user_id: number
  event_type: string
  page: string
  occurred_at: string
  session_id: string
}

export type RowValue = string | number | boolean
export type GenericRow = Record<string, RowValue>

export interface DataSet {
  users: UserRow[]
  orders: OrderRow[]
  products: ProductRow[]
  events: EventRow[]
}

export function getRowsByTable(data: DataSet, table: TableName): GenericRow[] {
  return data[table] as unknown as GenericRow[]
}
