<script setup lang="ts" generic="T extends Record<string, unknown>">
import type { BaseTableColumn, BaseTableProps } from './types'

const props = withDefaults(defineProps<BaseTableProps<T>>(), {
  loading: false,
  emptyText: 'No data',
  rowKey: undefined as never,
})

function resolveRowKey(row: T, index: number): string | number {
  const k = props.rowKey
  if (typeof k === 'function') return k(row)
  if (typeof k === 'string') return row[k] as string | number
  return index
}

function resolveCell(col: BaseTableColumn<T>, row: T, index: number) {
  if (col.render) return col.render(row, index)
  return row[col.key as keyof T] as unknown as string | number
}

function colClass(col: BaseTableColumn<T>) {
  if (col.align === 'center') return 'base-table__align-center'
  if (col.align === 'right') return 'base-table__align-right'
  return ''
}

function colStyle(col: BaseTableColumn<T>) {
  return col.width ? { width: typeof col.width === 'number' ? `${col.width}px` : col.width } : {}
}
</script>

<template>
  <div class="base-table">
    <div class="base-table__wrapper">
      <table class="base-table__el">
        <thead>
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              class="base-table__th"
              :class="colClass(col)"
              :style="colStyle(col)"
            >
              {{ col.title }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, idx) in rows"
            :key="resolveRowKey(row, idx)"
            class="base-table__row"
          >
            <td
              v-for="col in columns"
              :key="col.key"
              class="base-table__td"
              :class="colClass(col)"
            >
              {{ resolveCell(col, row, idx) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="loading" class="base-table__loading">Loading...</div>
    <div v-else-if="rows.length === 0" class="base-table__empty">{{ emptyText }}</div>
  </div>
</template>

<style lang="less" scoped src="./style.less" />
