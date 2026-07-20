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
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            {columns.map((col, i) => (
              <th key={i} className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/80" style={{ width: col.width }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-5 py-12 text-center text-slate-300 text-sm">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={i}
                onClick={() => onRowClick?.(row)}
                className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-blue-50/40' : 'hover:bg-slate-50/60'}`}
              >
                {columns.map((col, j) => (
                  <td key={j} className="px-5 py-3.5 text-slate-600">{col.cell(row)}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
