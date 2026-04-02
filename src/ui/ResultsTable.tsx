import { useMemo, useState } from 'react'
import { downloadCsv, toCsv } from '../engine/csv'
import { type GenericRow } from '../domain/dataset'

interface ResultsTableProps {
  rows: GenericRow[]
  columns: string[]
  totalRows: number
}

const ROW_HEIGHT = 36
const VIEWPORT_HEIGHT = 360

type SortState = {
  column: string
  direction: 'asc' | 'desc'
} | null

function compareCell(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b
  }

  return String(a).localeCompare(String(b), undefined, { sensitivity: 'base' })
}

export function ResultsTable({ rows, columns, totalRows }: ResultsTableProps) {
  const [scrollTop, setScrollTop] = useState(0)
  const [sort, setSort] = useState<SortState>(null)

  const sortedRows = useMemo(() => {
    if (!sort) {
      return rows
    }

    const sorted = [...rows].sort((a, b) => compareCell(a[sort.column], b[sort.column]))
    if (sort.direction === 'desc') {
      sorted.reverse()
    }
    return sorted
  }, [rows, sort])

  const visibleCount = Math.ceil(VIEWPORT_HEIGHT / ROW_HEIGHT)
  const start = Math.floor(scrollTop / ROW_HEIGHT)
  const end = Math.min(sortedRows.length, start + visibleCount + 8)
  const visibleRows = sortedRows.slice(start, end)
  const topPadding = start * ROW_HEIGHT
  const bottomPadding = Math.max(0, (sortedRows.length - end) * ROW_HEIGHT)

  return (
    <section className="panel results-panel">
      <div className="panel-header-row">
        <h2>Results</h2>
        <div className="inline-actions">
          <span className="panel-note">
            Showing {rows.length} rows (matched {totalRows})
          </span>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              const csv = toCsv(columns, sortedRows)
              downloadCsv('query-results.csv', csv)
            }}
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="table-shell">
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>
                  <button
                    type="button"
                    className="header-btn"
                    onClick={() => {
                      setSort((current) => {
                        if (!current || current.column !== column) {
                          return { column, direction: 'asc' }
                        }

                        return {
                          column,
                          direction: current.direction === 'asc' ? 'desc' : 'asc',
                        }
                      })
                    }}
                  >
                    {column}
                    {sort?.column === column ? (sort.direction === 'asc' ? ' ▲' : ' ▼') : ''}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
        </table>

        <div
          className="table-viewport"
          style={{ height: `${VIEWPORT_HEIGHT}px` }}
          onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
        >
          <table>
            <tbody>
              {topPadding > 0 ? (
                <tr>
                  <td style={{ height: `${topPadding}px` }} colSpan={columns.length}></td>
                </tr>
              ) : null}

              {visibleRows.map((row, rowIndex) => (
                <tr key={`${start + rowIndex}_${String(row[columns[0]])}`}>
                  {columns.map((column) => (
                    <td key={column}>{String(row[column])}</td>
                  ))}
                </tr>
              ))}

              {bottomPadding > 0 ? (
                <tr>
                  <td style={{ height: `${bottomPadding}px` }} colSpan={columns.length}></td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
