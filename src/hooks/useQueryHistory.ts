import { useCallback, useEffect, useState } from 'react'
import { type QueryDraft, type StoredQuery } from '../domain/query'

const HISTORY_KEY = 'query_builder_history_v1'

function readHistory(): StoredQuery[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw) as StoredQuery[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function useQueryHistory() {
  const [history, setHistory] = useState<StoredQuery[]>(() => readHistory())

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  }, [history])

  const pushHistory = useCallback((draft: QueryDraft, sql: string) => {
    setHistory((current) => {
      const next: StoredQuery[] = [
        {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          draft,
          sql,
        },
        ...current,
      ]

      return next.slice(0, 10)
    })
  }, [])

  return {
    history,
    pushHistory,
  }
}
