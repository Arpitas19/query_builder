import { type GenericRow } from '../domain/dataset'

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function toCsv(columns: string[], rows: GenericRow[]): string {
  const lines: string[] = [columns.join(',')]

  for (const row of rows) {
    const line = columns
      .map((column) => {
        const raw = row[column]
        return escapeCsv(String(raw ?? ''))
      })
      .join(',')
    lines.push(line)
  }

  return lines.join('\n')
}

export function downloadCsv(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
