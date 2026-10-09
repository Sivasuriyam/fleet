import { useState } from 'react'
import { Badge, Card, Empty, ErrorBox, Loading } from '../components/ui'
import { CITIES, lerp } from '../lib/geo'
import { useData } from '../store'

/** Interactive schematic map: pickup (green), delivery (red), vehicle (blue) along the route. */
export default function Tracking() {
  const { db, error, reload } = useData()
  const [sel, setSel] = useState('')
  if (error) return <ErrorBox msg={error} retry={reload} />
  if (!db) return <Loading />
  const live = db.shipments.filter((s) => s.status === 'in-transit' || s.status === 'delayed' || s.status === 'pending')
  const cur = db.shipments.find((s) => s.id === sel) ?? live[0]
  const veh = cur && db.vehicles.find((v) => v.id === cur.vehicleId), drv = cur && db.drivers.find((d) => d.id === cur.driverId)
  return (
    <div className="page space-y-4">
      <h1 className="text-xl font-semibold">Live tracking</h1>
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="!p-2">
          <svg viewBox="0 0 100 100" className="w-full rounded-2xl" style={{ background: 'var(--map)' }} role="img" aria-label="Fleet map"><defs><pattern id="gr" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0V10" fill="none" stroke="currentColor" strokeWidth=".15" opacity=".3" /></pattern></defs><rect width="100" height="100" fill="url(#gr)" className="text-slate-500" />
            {live.map((s) => { const [a, b] = [CITIES[s.pickup], CITIES[s.delivery]], on = s.id === cur?.id, p = lerp(a, b, s.progress)
              return <g key={s.id} className="cursor-pointer" onClick={() => setSel(s.id)}>
                <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={s.status === 'delayed' ? '#ef4444' : 'var(--pri)'} strokeWidth={on ? 1.2 : 0.5} strokeDasharray="2 1.5" opacity={on ? 1 : 0.5} className={on ? 'march' : ''} />
                <line key={sel + s.id} className="draw" pathLength={1} x1={a[0]} y1={a[1]} x2={p[0]} y2={p[1]} stroke={s.status === 'delayed' ? '#ef4444' : 'var(--pri)'} strokeWidth="1.4" strokeLinecap="round" />
                {on && <circle className="ping" cx={p[0]} cy={p[1]} r="2" fill="none" stroke="#2563eb" strokeWidth="0.6" />}
                <circle cx={p[0]} cy={p[1]} r={on ? 2.2 : 1.6} fill="#2563eb" stroke="#fff" strokeWidth="0.6"><title>{s.id}</title></circle></g> })}
            {Object.entries(CITIES).map(([name, [x, y]]) => <g key={name}>
              <circle cx={x} cy={y} r="1.2" fill={cur?.pickup === name ? '#16a34a' : cur?.delivery === name ? '#dc2626' : '#94a3b8'} />
              <text x={x > 80 ? x - 2 : x + 2} y={y + 1} textAnchor={x > 80 ? 'end' : 'start'} fontSize="3" className="fill-slate-700">{name}</text></g>)}
          </svg>
          <p className="p-2 text-xs text-slate-500">Green = pickup · Red = delivery · Blue = vehicle. Click a route or shipment to inspect.</p>
        </Card>
        <div className="space-y-3">
          <Card title="Shipment">{!cur ? <Empty text="No active shipments." /> : (
            <div className="space-y-1 text-sm"><p className="font-semibold">{cur.id} <Badge s={cur.status} /></p><p>{cur.customer}</p>
              <p>{cur.pickup} → {cur.delivery}</p><p>Vehicle: {veh ? `${veh.plate} (${veh.status})` : '—'}</p><p>Driver: {drv?.name ?? '—'}</p>
              <p>ETA: <b>{cur.eta}</b></p><div className="h-2 rounded bg-slate-100"><div className="h-2 rounded bg-indigo-500" style={{ width: `${cur.progress * 100}%` }} /></div><p className="text-xs text-slate-500">{Math.round(cur.progress * 100)}% of route</p></div>)}
          </Card>
          <Card title="Active shipments" className="max-h-64 overflow-y-auto">{live.map((s) => (
            <button key={s.id} onClick={() => setSel(s.id)} className={`mb-1 flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm hover:bg-slate-50 ${s.id === cur?.id ? 'bg-soft' : ''}`}>{s.id} · {s.delivery}<Badge s={s.status} /></button>))}</Card>
        </div>
      </div>
    </div>
  )
}
