interface SqlPreviewPanelProps {
  sql: string
}

export function SqlPreviewPanel({ sql }: SqlPreviewPanelProps) {
  return (
    <section className="panel">
      <h2>SQL Preview</h2>
      <pre>{sql}</pre>
    </section>
  )
}
