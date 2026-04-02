import { type StoredQuery } from '../domain/query'

interface QueryHistoryPanelProps {
  history: StoredQuery[]
  onRestore: (query: StoredQuery) => void
}

export function QueryHistoryPanel({ history, onRestore }: QueryHistoryPanelProps) {
  return (
    <section className="panel">
      <h2>Query History</h2>
      <p className="panel-note">Last 10 executed queries (stored in localStorage).</p>

      <ul className="history-list">
        {history.length === 0 ? <li className="panel-note">No query executed yet.</li> : null}
        {history.map((entry) => (
          <li key={entry.id}>
            <button
              type="button"
              className="history-item"
              onClick={() => {
                onRestore(entry)
              }}
            >
              <strong>{entry.draft.sourceTable}</strong>
              <span>{new Date(entry.createdAt).toLocaleString()}</span>
              <small>{entry.sql.replace(/\s+/g, ' ').slice(0, 120)}...</small>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
