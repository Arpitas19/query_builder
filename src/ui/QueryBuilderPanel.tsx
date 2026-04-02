import { type QueryDraft, type ConditionOperator, type LogicJoin } from '../domain/query'
import { getDefaultConditionValue } from '../engine/queryEngine'
import { getTableColumns, type TableName } from '../domain/schema'

interface QueryBuilderPanelProps {
  draft: QueryDraft
  onChange: (next: QueryDraft) => void
  onExecute: () => void
  onAddSelectColumnFromSchema: (column: string, table: TableName) => void
}

const operators: ConditionOperator[] = ['=', '!=', '>', '<', '>=', '<=', 'CONTAINS']

function appendCondition(draft: QueryDraft): QueryDraft {
  const columns = getTableColumns(draft.sourceTable)
  const firstColumn = columns[0]?.name ?? 'id'

  const nextCondition = {
    id: crypto.randomUUID(),
    column: firstColumn,
    operator: '=' as ConditionOperator,
    value: getDefaultConditionValue(draft.sourceTable, firstColumn),
    joinWithPrevious: draft.conditions.length > 0 ? ('AND' as LogicJoin) : undefined,
  }

  return {
    ...draft,
    conditions: [...draft.conditions, nextCondition],
  }
}

export function QueryBuilderPanel({
  draft,
  onChange,
  onExecute,
  onAddSelectColumnFromSchema,
}: QueryBuilderPanelProps) {
  const tableColumns = getTableColumns(draft.sourceTable)

  const resolvedSelectColumns =
    draft.selectColumns.length > 0 ? draft.selectColumns : tableColumns.map((column) => column.name)

  return (
    <section className="panel query-builder">
      <div className="panel-header-row">
        <h2>Query Builder</h2>
        <button type="button" onClick={onExecute}>
          Run Query
        </button>
      </div>

      <div className="query-grid">
        <label>
          Source table
          <select
            value={draft.sourceTable}
            onChange={(event) => {
              const nextTable = event.target.value as TableName
              onChange({
                ...draft,
                sourceTable: nextTable,
                selectColumns: [],
                conditions: [],
                orderBy: null,
              })
            }}
          >
            <option value="users">users</option>
            <option value="orders">orders</option>
            <option value="products">products</option>
            <option value="events">events</option>
          </select>
        </label>

        <label>
          LIMIT
          <input
            type="number"
            min={1}
            max={5000}
            value={draft.limit}
            onChange={(event) => {
              onChange({ ...draft, limit: Math.max(1, Number(event.target.value || 100)) })
            }}
          />
        </label>
      </div>

      <div className="subsection">
        <div className="subsection-header">
          <h3>SELECT</h3>
          <div className="inline-actions">
            <button type="button" className="secondary" onClick={() => onChange({ ...draft, selectColumns: [] })}>
              Select All
            </button>
            <button type="button" className="secondary" onClick={() => onChange({ ...draft, selectColumns: [] })}>
              Reset
            </button>
          </div>
        </div>

        <div
          className="select-chip-wrap dropzone"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            const raw = event.dataTransfer.getData('application/query-column')
            if (!raw) {
              return
            }

            const payload = JSON.parse(raw) as { table: TableName; column: string }
            onAddSelectColumnFromSchema(payload.column, payload.table)
          }}
        >
          {resolvedSelectColumns.map((column) => (
            <button
              key={column}
              type="button"
              className="chip"
              onClick={() => {
                const inCustomSelection = draft.selectColumns.includes(column)
                if (!inCustomSelection) {
                  const custom = tableColumns.map((c) => c.name).filter((name) => name !== column)
                  onChange({ ...draft, selectColumns: custom })
                  return
                }

                onChange({ ...draft, selectColumns: draft.selectColumns.filter((name) => name !== column) })
              }}
            >
              {column}
            </button>
          ))}
        </div>
      </div>

      <div className="subsection">
        <div className="subsection-header">
          <h3>WHERE</h3>
          <button type="button" className="secondary" onClick={() => onChange(appendCondition(draft))}>
            Add Condition
          </button>
        </div>

        {draft.conditions.length === 0 ? <p className="panel-note">No conditions yet.</p> : null}

        <div className="where-list">
          {draft.conditions.map((condition, index) => (
            <div key={condition.id} className="where-row">
              {index > 0 ? (
                <select
                  value={condition.joinWithPrevious ?? 'AND'}
                  onChange={(event) => {
                    onChange({
                      ...draft,
                      conditions: draft.conditions.map((entry) =>
                        entry.id === condition.id
                          ? { ...entry, joinWithPrevious: event.target.value as LogicJoin }
                          : entry,
                      ),
                    })
                  }}
                >
                  <option value="AND">AND</option>
                  <option value="OR">OR</option>
                </select>
              ) : (
                <span className="where-anchor">WHERE</span>
              )}

              <select
                value={condition.column}
                onChange={(event) => {
                  const nextColumn = event.target.value
                  onChange({
                    ...draft,
                    conditions: draft.conditions.map((entry) =>
                      entry.id === condition.id
                        ? {
                            ...entry,
                            column: nextColumn,
                            value: getDefaultConditionValue(draft.sourceTable, nextColumn),
                          }
                        : entry,
                    ),
                  })
                }}
              >
                {tableColumns.map((column) => (
                  <option key={column.name} value={column.name}>
                    {column.name}
                  </option>
                ))}
              </select>

              <select
                value={condition.operator}
                onChange={(event) => {
                  onChange({
                    ...draft,
                    conditions: draft.conditions.map((entry) =>
                      entry.id === condition.id
                        ? { ...entry, operator: event.target.value as ConditionOperator }
                        : entry,
                    ),
                  })
                }}
              >
                {operators.map((operator) => (
                  <option key={operator} value={operator}>
                    {operator}
                  </option>
                ))}
              </select>

              <input
                value={condition.value}
                onChange={(event) => {
                  onChange({
                    ...draft,
                    conditions: draft.conditions.map((entry) =>
                      entry.id === condition.id ? { ...entry, value: event.target.value } : entry,
                    ),
                  })
                }}
              />

              <button
                type="button"
                className="secondary"
                onClick={() => {
                  onChange({
                    ...draft,
                    conditions: draft.conditions.filter((entry) => entry.id !== condition.id),
                  })
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="subsection">
        <div className="subsection-header">
          <h3>ORDER BY</h3>
        </div>

        <div className="order-row">
          <select
            value={draft.orderBy?.column ?? ''}
            onChange={(event) => {
              const column = event.target.value
              if (!column) {
                onChange({ ...draft, orderBy: null })
                return
              }

              onChange({
                ...draft,
                orderBy: {
                  column,
                  direction: draft.orderBy?.direction ?? 'ASC',
                },
              })
            }}
          >
            <option value="">None</option>
            {tableColumns.map((column) => (
              <option key={column.name} value={column.name}>
                {column.name}
              </option>
            ))}
          </select>

          <select
            value={draft.orderBy?.direction ?? 'ASC'}
            disabled={!draft.orderBy}
            onChange={(event) => {
              if (!draft.orderBy) {
                return
              }

              onChange({
                ...draft,
                orderBy: { ...draft.orderBy, direction: event.target.value as 'ASC' | 'DESC' },
              })
            }}
          >
            <option value="ASC">ASC</option>
            <option value="DESC">DESC</option>
          </select>
        </div>
      </div>
    </section>
  )
}
