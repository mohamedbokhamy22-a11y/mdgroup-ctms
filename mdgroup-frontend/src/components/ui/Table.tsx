import { type ReactNode } from 'react'

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
      className="overflow-hidden rounded-xl overflow-x-auto"
      style={{
        background: '#ffffff',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <table className="w-full" style={{ minWidth: '600px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-border)', background: '#F9FAFB' }}>
            {columns.map((col, i) => (
              <th
                key={i}
                className="px-5 py-3.5 text-left"
                style={{ width: col.width }}
              >
                <span className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">
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
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-xl">📭</span>
                  </div>
                  <p className="text-gray-400 text-[17px] font-medium">{emptyMessage}</p>
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
                  borderTop: i > 0 ? '1px solid var(--color-border)' : undefined,
                  cursor: onRowClick ? 'pointer' : undefined,
                  height: 'var(--table-row-height)',
                }}
                onMouseEnter={e => {
                  if (onRowClick) (e.currentTarget as HTMLTableRowElement).style.background = '#F0F4FF'
                  else (e.currentTarget as HTMLTableRowElement).style.background = '#F9FAFB'
                }}
                onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = '' }}
              >
                {columns.map((col, j) => (
                  <td key={j} className="px-5 py-3 text-[15px] text-gray-700" style={{ maxWidth: col.width ?? '200px' }}>
                    <div className="truncate">
                      {col.cell(row)}
                    </div>
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
