import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Badge, Btn, Card, Empty, ErrorBox, inp, Loading } from '../components/ui'
import { CITIES, isoDate } from '../lib/geo'
import { useData } from '../store'

type Kind = 'vehicles' | 'drivers' | 'shipments'
interface Item { kind: Kind; id: string; title: string; sub: string; status: string; locs: string[]; date?: string; hay: string }
const ICON: Record<Kind, string> = { vehicles: '🚛', drivers: '🧑‍✈️', shipments: '📦' }
const PRESETS: [string, Record<string, string>][] = [
  ['⏱️ Delayed shipments', { kind: 'shipments', status: 'delayed' }], ['🔧 In maintenance', { kind: 'vehicles', status: 'maintenance' }],
  ['🟢 Available drivers', { kind: 'drivers', status: 'available' }], ['📅 Service due ≤ 14 days', { kind: 'vehicles', to: isoDate(14) }],
]

function Hl({ t, q }: { t: string; q: string[] }) {
  if (!q.length) return <>{t}</>
  const re = new RegExp(`(${q.map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
  return <>{t.split(re).map((p, i) => (i % 2 ? <mark key={i} className="rounded bg-yellow-200 px-0.5 text-slate-900">{p}</mark> : p))}</>
}

/** Global search across vehicles, drivers and shipments. Filters live in the URL so results are shareable. */
export default function Search() {
  const { db, error, reload } = useData()
  const [sp, setSp] = useSearchParams()
  const g = (k: string) => sp.get(k) ?? ''
  const set = (patch: Record<string, string>) => { const n = new URLSearchParams(sp); Object.entries(patch).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k))); setSp(n, { replace: true }) }

  const items = useMemo<Item[]>(() => {
    if (!db) return []
    const dn = (id: string) => db.drivers.find((d) => d.id === id)?.name ?? '', vp = (id: string) => db.vehicles.find((v) => v.id === id)?.plate ?? ''
    return [
      ...db.vehicles.map((v): Item => ({ kind: 'vehicles', id: v.id, title: `${v.plate} · ${v.model}`, sub: `${dn(v.driverId) || 'No driver'} · ${v.location} · fuel ${v.fuel}%`, status: v.status, locs: [v.location], date: v.nextService, hay: [v.id, v.plate, v.model, v.location, dn(v.driverId), v.status].join(' ') })),
      ...db.drivers.map((d): Item => ({ kind: 'drivers', id: d.id, title: d.name, sub: `${d.phone} · ${vp(d.vehicleId) || 'No vehicle'} · ${d.location}`, status: d.status, locs: [d.location], hay: [d.id, d.name, d.phone, d.location, vp(d.vehicleId), d.status].join(' ') })),
      ...db.shipments.map((s): Item => ({ kind: 'shipments', id: s.id, title: `${s.id} · ${s.customer}`, sub: `${s.pickup} → ${s.delivery} · ETA ${s.eta}`, status: s.status, locs: [s.pickup, s.delivery], date: s.date, hay: [s.id, s.customer, s.pickup, s.delivery, dn(s.driverId), vp(s.vehicleId), s.status].join(' ') })),
    ]
  }, [db])

  if (error) return <ErrorBox msg={error} retry={reload} />
  if (!db) return <Loading />

  const terms = g('q').toLowerCase().split(/\s+/).filter(Boolean)
  const base = items.filter((i) => terms.every((t) => i.hay.toLowerCase().includes(t)) && (!g('status') || i.status === g('status')) && (!g('loc') || i.locs.includes(g('loc')))
    && (!g('from') || (i.date && i.date >= g('from'))) && (!g('to') || (i.date && i.date <= g('to'))))
  const rows = base.filter((i) => !g('kind') || i.kind === g('kind'))
  const statuses = [...new Set(items.filter((i) => !g('kind') || i.kind === g('kind')).map((i) => i.status))]
  const active = ['q', 'kind', 'status', 'loc', 'from', 'to'].some((k) => g(k))

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Search & filters</h1>
      <Card className="space-y-3">
        <input autoFocus className={`${inp} !py-3 !text-base`} placeholder="Search vehicles, drivers, shipments, customers, plates, cities…" value={g('q')} onChange={(e) => set({ q: e.target.value })} />
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <select className={inp} value={g('status')} onChange={(e) => set({ status: e.target.value })}><option value="">Any status</option>{statuses.map((s) => <option key={s}>{s}</option>)}</select>
          <select className={inp} value={g('loc')} onChange={(e) => set({ loc: e.target.value })}><option value="">Any location</option>{Object.keys(CITIES).map((s) => <option key={s}>{s}</option>)}</select>
          <label className="flex items-center gap-2 text-xs text-slate-500">From<input type="date" className={inp} value={g('from')} onChange={(e) => set({ from: e.target.value })} /></label>
          <label className="flex items-center gap-2 text-xs text-slate-500">To<input type="date" className={inp} value={g('to')} onChange={(e) => set({ to: e.target.value })} /></label>
          <Btn v="ghost" disabled={!active} onClick={() => setSp({}, { replace: true })}>Clear all</Btn>
        </div>
        <div className="flex flex-wrap gap-2">{PRESETS.map(([l, p]) => <button key={l} onClick={() => setSp(p, { replace: true })} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100">{l}</button>)}</div>
        <p className="text-xs text-slate-500">Date range applies to shipment ship date and vehicle next-service date.</p>
      </Card>
      <div className="flex flex-wrap gap-2">{([['', 'All'], ['vehicles', 'Vehicles'], ['drivers', 'Drivers'], ['shipments', 'Shipments']] as [string, string][]).map(([k, l]) => (
        <button key={k} onClick={() => set({ kind: k })} className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${g('kind') === k ? 'bg-linear-to-r from-indigo-600 to-indigo-500 text-white shadow' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'}`}>{l} <span className="opacity-70">{base.filter((i) => !k || i.kind === k).length}</span></button>))}</div>
      {!rows.length ? <Card><Empty text="No results. Try fewer words or clear a filter." /></Card> : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{rows.map((r, i) => (
          <Link key={r.kind + r.id} to={`/${r.kind}`} style={{ '--i': i } as React.CSSProperties} className="rise lift flex gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-50 text-xl">{ICON[r.kind]}</span>
            <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><b className="truncate"><Hl t={r.title} q={terms} /></b><Badge s={r.status} /></div>
              <p className="truncate text-sm text-slate-500"><Hl t={r.sub} q={terms} /></p><p className="mt-1 text-xs capitalize text-slate-400">{r.kind.slice(0, -1)} · {r.id}{r.date && ` · ${r.date}`}</p></div>
          </Link>))}</div>)}
    </div>
  )
}
