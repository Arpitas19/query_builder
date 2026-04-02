import { SCHEMA, type TableName } from '../domain/schema'

interface SchemaExplorerProps {
  sourceTable: TableName
  onAddColumn: (column: string, table: TableName) => void
}

export function SchemaExplorer({ sourceTable, onAddColumn }: SchemaExplorerProps) {
  return (
    <section className="panel schema-explorer">
      <h2>Schema Explorer</h2>
      <p className="panel-note">Click a column to add it to SELECT. Drag-drop also works.</p>

      <div className="schema-table-list">
        {(Object.keys(SCHEMA) as TableName[]).map((table) => (
          <article key={table} className="schema-table-card">
            <header>
              <h3>{table}</h3>
              {table === sourceTable ? <span className="tag">active</span> : null}
            </header>

            <ul>
              {SCHEMA[table].map((column) => (
                <li key={column.name}>
                  <button
                    type="button"
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData(
                        'application/query-column',
                        JSON.stringify({ table, column: column.name }),
                      )
                    }}
                    onClick={() => onAddColumn(column.name, table)}
                  >
                    <strong>{column.name}</strong>
                    <span>{column.type}</span>
                  </button>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}
