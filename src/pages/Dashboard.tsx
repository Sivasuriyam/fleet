import { Bar, Badge, Card, CountUp, ErrorBox, Loading } from '../components/ui'
import { useData } from '../store'

const avg = (l: number[]) => (l.length ? Math.round(l.reduce((a, b) => a + b, 0) / l.length) : 0)
const WEEK: [string, number][] = [['Mon', 4], ['Tue', 6], ['Wed', 5], ['Thu', 8], ['Fri', 7], ['Sat', 3], ['Sun', 9]]
const SEG: [string, string, string][] = [['delivered', '#10b981', 'Delivered'], ['in-transit', '#06b6d4', 'In transit'], ['pending', '#f59e0b', 'Pending'], ['delayed', '#f43f5e', 'Delayed']]

export default function Dashboard() {
  const { db, error, reload, alerts } = useData()
  if (error) return <ErrorBox msg={error} retry={reload} />
  if (!db) return <Loading />
  const { vehicles: V, drivers: D, shipments: S } = db
  const n = (st: string) => S.filter((s) => s.status === st).length
  const done = n('delivered'), late = n('delayed'), total = S.length || 1
  const stats: [string, number, string, string][] = [
    ['Vehicles', V.length, '🚛', 'from-indigo-500 to-indigo-700'], ['Drivers', D.length, '🧑‍✈️', 'from-violet-500 to-violet-700'],
    ['Active shipments', n('in-transit') + late, '📦', 'from-sky-500 to-sky-700'], ['Delivered', done, '✅', 'from-emerald-500 to-emerald-700'],
    ['In transit', n('in-transit'), '🛣️', 'from-cyan-500 to-cyan-700'], ['Delayed', late, '⏱️', 'from-rose-500 to-rose-700'],
  ]
  let off = 0
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {stats.map(([k, v, ic, g], i) => (
          <div key={k} style={{ '--i': i } as React.CSSProperties} className={`rise lift rounded-2xl bg-linear-to-br ${g} p-4 text-white shadow-lg`}>
            <div className="flex items-center justify-between"><span className="text-xs opacity-90">{k}</span><span className="grid h-8 w-8 place-items-center rounded-full bg-white/20">{ic}</span></div>
            <div className="mt-2 text-3xl font-bold"><CountUp to={v} /></div>
          </div>))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Delivery performance" i={2}>
          <div className="flex items-center gap-4">
            <svg viewBox="0 0 42 42" className="w-32 shrink-0 -rotate-90" role="img" aria-label="Shipments by status">
              <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--color-slate-100)" strokeWidth="5" />
              {SEG.map(([k, c]) => { const p = (n(k) / total) * 100, o = off; off += p
                return <circle key={k} pathLength="100" cx="21" cy="21" r="15.9" fill="none" stroke={c} strokeWidth="5" strokeDasharray={`${p} ${100 - p}`} strokeDashoffset={-o} className="seg" /> })}
              <text x="21" y="21" transform="rotate(90 21 21)" textAnchor="middle" dominantBaseline="central" fontSize="8" fontWeight="700" fill="var(--color-slate-800)">{done + late ? Math.round((done / (done + late)) * 100) : 100}%</text>
            </svg>
            <ul className="space-y-1 text-sm">{SEG.map(([k, c, l]) => <li key={k} className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />{l} <b>{n(k)}</b></li>)}</ul>
          </div>
          <p className="mt-3 text-xs text-slate-500">Avg driver on-time rate: {avg(D.map((d) => d.onTime))}%</p>
        </Card>
        <Card title="Fleet performance" i={3}>
          {['active', 'idle', 'maintenance'].map((s) => <Bar key={s} label={s} value={V.filter((v) => v.status === s).length} max={V.length} color="bg-linear-to-r from-indigo-500 to-indigo-600" />)}
          <p className="mt-2 text-xs text-slate-500">Avg fuel level: {avg(V.map((v) => v.fuel))}% · Avg rating: ★ {(D.reduce((a, d) => a + d.rating, 0) / (D.length || 1)).toFixed(1)}</p>
        </Card>
        <Card title={`Alerts (${alerts.length})`} className="max-h-72 overflow-y-auto" i={4}>
          {alerts.length ? alerts.map((a) => <p key={a.id} className={`mb-2 rounded-r-lg border-l-4 pl-2 text-sm ${a.level === 'high' ? 'border-red-500 bg-red-50' : 'border-blue-400 bg-slate-50'}`}><b>{a.type}:</b> {a.msg}</p>) : <p className="text-sm text-slate-500">All clear.</p>}
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Recent activity" className="lg:col-span-2" i={5}>
          <ul className="divide-y divide-slate-100 text-sm">{[...S].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6).map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-2"><span><b>{s.id}</b> · {s.customer} · {s.pickup} → {s.delivery}</span><Badge s={s.status} /></li>))}</ul>
        </Card>
        <Card title="Weekly deliveries" i={6}>
          <div className="flex h-36 items-end justify-between gap-2">{WEEK.map(([d, v], i) => (
            <div key={d} className="flex h-full flex-1 flex-col items-center justify-end gap-1"><div className="growy w-full rounded-t-lg bg-linear-to-t from-indigo-600 to-indigo-500" style={{ height: `${v * 10}%`, '--i': i } as React.CSSProperties} title={`${v}`} /><span className="text-xs text-slate-500">{d}</span></div>))}</div>
        </Card>
      </div>
    </div>
  )
}
