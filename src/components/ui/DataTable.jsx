import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, Search, Inbox } from 'lucide-react'

/**
 * Responsive client-side data table with search + sort + pagination.
 * columns: [{ key, header, render?(row), sortable?, primary? }]
 *
 * On screens narrower than `sm` it automatically switches from a horizontally
 * scrolling table to a stacked card list (one card per row, label/value
 * pairs) so nothing ever requires horizontal scrolling on a phone.
 */
export default function DataTable({ columns, data = [], searchable = true, pageSize = 10, emptyLabel = 'No records found', actions }) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState({ key: null, dir: 'asc' })
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    if (!query) return data
    const q = query.toLowerCase()
    return data.filter((row) => Object.values(row).some((v) => String(v ?? '').toLowerCase().includes(q)))
  }, [data, query])

  const sorted = useMemo(() => {
    if (!sort.key) return filtered
    return [...filtered].sort((a, b) => {
      const av = a[sort.key], bv = b[sort.key]
      if (av === bv) return 0
      const cmp = av > bv ? 1 : -1
      return sort.dir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sort])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize)
  const primaryCol = columns.find((c) => c.primary) ?? columns[0]

  function toggleSort(key) {
    setSort((prev) => (prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))
  }

  return (
    <div>
      {searchable && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative w-full max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1) }}
              placeholder="Search…"
              className="input-field pl-9"
            />
          </div>
          <span className="text-xs text-slate-400">{sorted.length} result{sorted.length !== 1 && 's'}</span>
        </div>
      )}

      {paged.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 px-4 py-12 text-center text-slate-400">
          <Inbox className="mx-auto mb-2" size={28} />
          {emptyLabel}
        </div>
      ) : (
        <>
          {/* ---- Mobile: stacked cards (no horizontal scroll) ---- */}
          <div className="space-y-3 sm:hidden">
            {paged.map((row, i) => (
              <div key={row.id ?? i} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="break-words text-sm font-semibold text-navy-900">
                    {primaryCol?.render ? primaryCol.render(row) : row[primaryCol?.key]}
                  </div>
                  {actions && <div className="shrink-0">{actions(row)}</div>}
                </div>
                <dl className="space-y-1.5">
                  {columns.filter((c) => c.key !== primaryCol?.key).map((col) => (
                    <div key={col.key} className="flex items-start justify-between gap-3 text-xs">
                      <dt className="shrink-0 text-slate-400">{col.header}</dt>
                      <dd className="break-words text-right text-slate-700">{col.render ? col.render(row) : row[col.key]}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>

          {/* ---- sm and up: standard table ---- */}
          <div className="hidden overflow-x-auto rounded-lg border border-slate-200 sm:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => col.sortable && toggleSort(col.key)}
                      className={`whitespace-nowrap px-4 py-3 font-semibold ${col.sortable ? 'cursor-pointer select-none' : ''}`}
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.header}
                        {col.sortable && sort.key === col.key && (sort.dir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
                      </span>
                    </th>
                  ))}
                  {actions && <th className="px-4 py-3" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paged.map((row, i) => (
                  <tr key={row.id ?? i} className="hover:bg-slate-50/70">
                    {columns.map((col) => (
                      <td key={col.key} className="whitespace-nowrap px-4 py-3 text-slate-700">
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                    {actions && <td className="px-4 py-3 text-right">{actions(row)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-slate-500">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button className="btn-outline px-3 py-1.5" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
            <button className="btn-outline px-3 py-1.5" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        </div>
      )}
    </div>
  )
}cat .gitignore