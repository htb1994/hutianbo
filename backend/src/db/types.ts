/**
 * Dialect-agnostic database interface. All repository code in
 * `modules/<name>/<name>.repository.ts` MUST go through this interface.
 *
 * Placeholder convention: SQL strings always use `?` positional placeholders.
 * The PostgreSQL adapter rewrites them to `$1, $2, ...` internally so module
 * code stays portable.
 */

export type Dialect = 'sqlite' | 'postgres'

export interface QueryResult {
  rowsAffected: number
  lastInsertId?: string | number
}

export interface Database {
  /** Run a SELECT and return all rows (empty array if none). */
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>

  /** Run a SELECT and return the first row or `null`. */
  queryOne<T = unknown>(sql: string, params?: unknown[]): Promise<T | null>

  /** Run an INSERT/UPDATE/DELETE/DDL statement. Single statement only. */
  execute(sql: string, params?: unknown[]): Promise<QueryResult>

  /**
   * Execute one or more statements without parameters. Use this for migration
   * files and other DDL scripts that contain multiple `;`-separated statements.
   */
  executeScript(sql: string): Promise<void>

  /** Atomically run `fn` inside a transaction (commits or rolls back). */
  transaction<T>(fn: (tx: Database) => Promise<T>): Promise<T>

  /** The underlying dialect, useful for the migrator. */
  readonly dialect: Dialect

  /** Release resources. After calling, the instance is unusable. */
  close(): Promise<void>
}
