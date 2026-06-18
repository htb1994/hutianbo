export interface Todo {
  id: string
  title: string
  done: boolean
  createdAt: string
}

export interface TodoCreateInput {
  title: string
  done?: boolean
}

export interface TodoUpdateInput {
  title?: string
  done?: boolean
}
