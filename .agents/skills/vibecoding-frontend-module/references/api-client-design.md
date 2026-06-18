# Frontend API client design

Full rules: [vibecoding-verify/references/api-contract.md](../../vibecoding-verify/references/api-contract.md)

## Single HTTP entry point

Only `modules/<name>/api/index.ts` may import from `@/utils/request`.

```ts
import { http } from '@/utils/request'
import type { Note } from '../types'

export const noteApi = {
  list: () => http.get<Note[]>('/note'),
  create: (input: NoteCreateInput) => http.post<Note>('/note', input),
}
```

## Path convention

- `http.get('/note')` resolves to `/api/note` (Vite proxy + request baseURL)
- Must match backend prefix `/api/<name>`

## Forbidden in views / store / components

```ts
await fetch('/api/note')           // use api/index.ts
import { http } from '@/utils/request'  // only in api/
```

## Types alignment

`types/index.ts` response interface must include all fields from backend `<Name>Schema` (camelCase).
