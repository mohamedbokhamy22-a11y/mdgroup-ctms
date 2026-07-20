import { ReactNode } from 'react'

interface Column<T> {
  header: string
  cell: (row: T) => ReactNode
  width?: string
}

interface Props<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (row: T) => void
  emptyMessage?: string
}

export default function Table<T>({ columns, data, onRowClick, emptyMessage = 'No records found' }: Props<T>) {
  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{
        background: '#ffffff',
        border: '1px solid rgba(15,23,42,0.07)',
        boxShadow: '0 1px 3px rgba(15,23,42,0.05), 0 4px 16px rgba(15,23,42,0.04)',
      }}
    >
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(15,23,42,0.06)', background: 'rgba(248,250,252,0.8)' }}>
            {columns.map((col, i) => (
              <th
                key={i}
                className="px-5 py-3.5 text-left"
                style={{ width: col.width }}
              >
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest">
                  {col.header}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-5 py-16 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <span className="text-xl">📭</span>
                  </div>
                  <p className="text-slate-400 text-sm font-medium">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={i}
                onClick={() => onRowClick?.(row)}
                className="transition-colors"
                style={{
                  borderTop: i > 0 ? '1px solid rgba(15,23,42,0.04)' : undefined,
                  cursor: onRowClick ? 'pointer' : undefined,
                }}
                onMouseEnter={e => {
                  if (onRowClick) (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(99,102,241,0.04)'
                  else (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(15,23,42,0.02)'
                }}
                onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = '' }}
              >
                {columns.map((col, j) => (
                  <td key={j} className="px-5 py-3.5 text-[13px] text-slate-600 font-medium">
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
