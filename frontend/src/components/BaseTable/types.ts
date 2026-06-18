export interface BaseTableColumn<T = Record<string, unknown>> {
  key: string
  title: string
  width?: string | number
  align?: 'left' | 'center' | 'right'
  /** Custom cell renderer; falls back to `row[key]`. */
  render?: (row: T, index: number) => string | number | null | undefined
}

export interface BaseTableProps<T = Record<string, unknown>> {
  columns: BaseTableColumn<T>[]
  rows: T[]
  rowKey?: keyof T | ((row: T) => string | number)
  loading?: boolean
  emptyText?: string
}
