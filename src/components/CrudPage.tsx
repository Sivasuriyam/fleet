import { CSSProperties, ReactNode, useMemo, useState } from 'react'
import { DB, Kind } from '../types'
import { useData } from '../store'
import { CITIES } from '../lib/geo'
import { Btn, Card, Empty, ErrorBox, inp, Loading, Modal } from './ui'

export interface FieldDef<T> { k: keyof T & string; label: string; type?: 'text' | 'number' | 'date' | 'select'; options?: (db: DB) => [string, string][]; req?: boolean; min?: number; max?: number }
export interface Cfg<T> {
  kind: Kind; title: string; prefix: string; blank: T; fields: FieldDef<T>[]
  cols: { h: string; cell: (r: T, db: DB) => ReactNode; hide?: boolean }[]
  statuses: string[]; locKeys: (keyof T & string)[]; dateKey?: keyof T & string; dateLabel?: string
  validate?: (v: T, db: DB) => Record<string, string>
  detail: (r: T, db: DB) => ReactNode
}
export const opts = (a: string[]) => (): [string, string][] => a.map((x) => [x, x])

/** Generic list + filters + create/edit form (with validation) + detail view, driven by a config object. */
export default function CrudPage<T extends { id: string }>({ c }: { c: Cfg<T> }) {
  const { db, error, reload, save, remove } = useData()
  const [f, setF] = useState({ q: '', status: '', loc: '', from: '' })
  const [edit, setEdit] = useState<T | null>(null), [view, setView] = useState<T | null>(null)
  const [err, setErr] = useState<Record<string, string>>({}), [busy, setBusy] = useState(false)

  const rows = useMemo(() => (db ? (db[c.kind] as unknown as T[]) : []).filter((r) => {
    const o = r as Record<string, unknown>
    return (!f.q || Object.values(o).join(' ').toLowerCase().includes(f.q.toLowerCase())) && (!f.status || o.status === f.status) &&
      (!f.loc || c.locKeys.some((k) => o[k] === f.loc)) && (!f.from || !c.dateKey || String(o[c.dateKey]) >= f.from)
  }), [db, f, c])

  if (error) return <ErrorBox msg={error} retry={reload} />
  if (!db) return <Loading />

  const submit = async () => {
    if (!edit) return
    const o = edit as Record<string, unknown>, e: Record<string, string> = {}
    c.fields.forEach((fd) => {
      const v = String(o[fd.k] ?? '').trim()
      if (fd.req && !v) e[fd.k] = 'Required'
      else if (fd.type === 'number' && v) { const n = Number(v); if (isNaN(n) || n < (fd.min ?? -Infinity) || n > (fd.max ?? Infinity)) e[fd.k] = `Enter ${fd.min}–${fd.max}` }
    })
    if (!Object.keys(e).length && c.validate) Object.assign(e, c.validate(edit, db))
    setErr(e)
    if (Object.keys(e).length) return
    setBusy(true)
    try { await save(c.kind, { ...edit, id: edit.id || `${c.prefix}-${Math.floor(1000 + Math.random() * 9000)}` }); setEdit(null) } finally { setBusy(false) }
  }
  const set = (fd: FieldDef<T>, v: string) => setEdit({ ...edit!, [fd.k]: fd.type === 'number' ? (v === '' ? '' : Number(v)) : v })
  const sel = `${inp} sm:w-auto`

  return (
    <div className="page space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-xl font-semibold">{c.title}</h1><Btn onClick={() => { setErr({}); setEdit({ ...c.blank }) }}>+ Add</Btn></div>
      <Card className="grid gap-2 sm:flex sm:flex-wrap">
        <input className={`${sel} sm:flex-1`} placeholder="Search…" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
        <select className={sel} value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}><option value="">All statuses</option>{c.statuses.map((s) => <option key={s}>{s}</option>)}</select>
        <select className={sel} value={f.loc} onChange={(e) => setF({ ...f, loc: e.target.value })}><option value="">All locations</option>{Object.keys(CITIES).map((s) => <option key={s}>{s}</option>)}</select>
        {c.dateKey && <label className="flex items-center gap-2 text-sm text-slate-500">{c.dateLabel}<input type="date" className={sel} value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} /></label>}
        <Btn v="ghost" onClick={() => setF({ q: '', status: '', loc: '', from: '' })}>Clear</Btn>
      </Card>
      <Card className="overflow-x-auto !p-0">
        {!rows.length ? <Empty text={`No ${c.title.toLowerCase()} match your filters.`} /> : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{c.cols.map((x) => <th key={x.h} className={`px-4 py-3 ${x.hide ? 'hidden md:table-cell' : ''}`}>{x.h}</th>)}<th /></tr></thead>
            <tbody>{rows.map((r, i) => (
              <tr key={r.id} style={{ '--i': i } as CSSProperties} className="border-t border-slate-100 hover:bg-slate-50">
                {c.cols.map((x) => <td key={x.h} className={`px-4 py-3 ${x.hide ? 'hidden md:table-cell' : ''}`}>{x.cell(r, db)}</td>)}
                <td className="whitespace-nowrap px-2 text-right">
                  <Btn v="ghost" onClick={() => setView(r)}>View</Btn>
                  <Btn v="ghost" onClick={() => { setErr({}); setEdit({ ...r }) }}>Edit</Btn>
                  <Btn v="danger" onClick={() => confirm(`Delete ${r.id}?`) && remove(c.kind, r.id)}>Delete</Btn>
                </td>
              </tr>))}</tbody>
          </table>)}
      </Card>
      {view && <Modal title={view.id} onClose={() => setView(null)}>{c.detail(view, db)}</Modal>}
      {edit && (
        <Modal title={`${edit.id ? 'Edit' : 'Add'} ${c.title.replace(/s$/, '')}`} onClose={() => setEdit(null)}>
          <div className="grid gap-3 sm:grid-cols-2">
            {c.fields.map((fd) => {
              const v = String((edit as Record<string, unknown>)[fd.k] ?? '')
              return (
                <label key={fd.k} className="text-sm"><span className="mb-1 block text-slate-600">{fd.label}{fd.req && ' *'}</span>
                  {fd.type === 'select'
                    ? <select className={inp} value={v} onChange={(e) => set(fd, e.target.value)}>{fd.options!(db).map(([val, l]) => <option key={val} value={val}>{l}</option>)}</select>
                    : <input className={inp} type={fd.type ?? 'text'} value={v} onChange={(e) => set(fd, e.target.value)} />}
                  {err[fd.k] && <span className="text-xs text-red-600">{err[fd.k]}</span>}
                </label>)
            })}
          </div>
          <div className="mt-5 flex justify-end gap-2"><Btn v="ghost" onClick={() => setEdit(null)}>Cancel</Btn><Btn onClick={submit} disabled={busy}>{busy ? 'Saving…' : 'Save'}</Btn></div>
        </Modal>)}
    </div>
  )
}
