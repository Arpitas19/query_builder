import { useMemo, useState } from 'react'
import { generateMockData } from './data/mockData'
import { createDefaultQueryDraft, type QueryDraft, type StoredQuery } from './domain/query'
import { getTableColumns, type TableName } from './domain/schema'
import { executeQuery } from './engine/queryEngine'
import { toSql } from './engine/sqlBuilder'
import { useQueryHistory } from './hooks/useQueryHistory'
import { QueryBuilderPanel } from './ui/QueryBuilderPanel'
import { QueryHistoryPanel } from './ui/QueryHistoryPanel'
import { ResultsTable } from './ui/ResultsTable'
import { SchemaExplorer } from './ui/SchemaExplorer'
import { SqlPreviewPanel } from './ui/SqlPreviewPanel'

function App() {
  const data = useMemo(() => generateMockData(20260401), [])
  const [draft, setDraft] = useState<QueryDraft>(() => createDefaultQueryDraft())
  const { history, pushHistory } = useQueryHistory()

  const sql = useMemo(() => toSql(draft), [draft])
  const result = useMemo(() => executeQuery(data, draft), [data, draft])

  const addColumnFromSchema = (column: string, table: TableName) => {
    setDraft((current) => {
      if (table !== current.sourceTable) {
        return {
          ...createDefaultQueryDraft(),
          sourceTable: table,
          selectColumns: [column],
        }
      }

      if (current.selectColumns.length === 0) {
        return {
          ...current,
          selectColumns: [column],
        }
      }

      if (current.selectColumns.includes(column)) {
        return current
      }

      return {
        ...current,
        selectColumns: [...current.selectColumns, column],
      }
    })
  }

  return (
    <main className="page">
      <header className="hero-header">
        <p className="eyebrow">Browser-Only Analytical Playground</p>
        <h1>Visual Query Builder</h1>
        <p className="subtitle">
          Build SQL-like queries via clicks or drag-drop over in-memory relational mock data.
        </p>
      </header>

      <div className="layout-grid">
        <SchemaExplorer sourceTable={draft.sourceTable} onAddColumn={addColumnFromSchema} />

        <QueryBuilderPanel
          draft={draft}
          onChange={setDraft}
          onExecute={() => {
            pushHistory(JSON.parse(JSON.stringify(draft)) as QueryDraft, sql)
          }}
          onAddSelectColumnFromSchema={addColumnFromSchema}
        />
      </div>

      <ResultsTable rows={result.rows} columns={result.columns} totalRows={result.totalRows} />

      <div className="layout-grid">
        <SqlPreviewPanel sql={sql} />
        <QueryHistoryPanel
          history={history}
          onRestore={(query: StoredQuery) => {
            const knownColumns = getTableColumns(query.draft.sourceTable).map((col) => col.name)
            const filteredSelect = query.draft.selectColumns.filter((col) => knownColumns.includes(col))

            setDraft({
              ...query.draft,
              selectColumns: filteredSelect,
            })
          }}
        />
      </div>
    </main>
  )
}

export default App
