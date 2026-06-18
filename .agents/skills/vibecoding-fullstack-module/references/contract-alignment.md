# Full-stack contract alignment

When adding module `<name>` on both backend and frontend, keep these in sync.

## Field mapping template

Fill this table before implementing frontend types:

| Backend `<Name>Schema` field | Frontend `types/<Name>` field | Notes |
|-----------------------------|-------------------------------|-------|
| id: string | id: string | nanoid |
| title: string | title: string | |
| done: boolean | done: boolean | |
| createdAt: string | createdAt: string | ISO string |

## Path mapping

| Backend | Frontend api path |
|---------|-------------------|
| `GET /api/<name>/` | `http.get('/<name>')` |
| `GET /api/<name>/:id` | `http.get('/<name>/${id}')` |
| `POST /api/<name>/` | `http.post('/<name>', input)` |
| `PATCH /api/<name>/:id` | `http.patch('/<name>/${id}', input)` |
| `DELETE /api/<name>/:id` | `http.delete('/<name>/${id}')` |

## Verification

`check-api.mjs` compares backend zod schema keys with frontend interface fields for modules that exist on both sides. Mismatches fail with `API-ALIGN`.
