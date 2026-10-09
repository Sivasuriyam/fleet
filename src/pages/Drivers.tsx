import CrudPage, { Cfg, opts } from '../components/CrudPage'
import { Badge } from '../components/ui'
import { CITIES } from '../lib/geo'
import { Driver } from '../types'

const c: Cfg<Driver> = {
  kind: 'drivers', title: 'Drivers', prefix: 'DR',
  blank: { id: '', name: '', phone: '', status: 'available', vehicleId: '', rating: 5, onTime: 100, deliveries: 0, location: 'Chicago' },
  fields: [
    { k: 'name', label: 'Full name', req: true }, { k: 'phone', label: 'Phone', req: true },
    { k: 'status', label: 'Availability', type: 'select', options: opts(['available', 'on-trip', 'off-duty']) },
    { k: 'vehicleId', label: 'Vehicle', type: 'select', options: (db) => [['', 'Unassigned'], ...db.vehicles.map((v): [string, string] => [v.id, v.plate])] },
    { k: 'rating', label: 'Rating (0-5)', type: 'number', min: 0, max: 5, req: true },
    { k: 'onTime', label: 'On-time %', type: 'number', min: 0, max: 100, req: true },
    { k: 'location', label: 'Location', type: 'select', options: opts(Object.keys(CITIES)) },
  ],
  cols: [
    { h: 'Driver', cell: (d) => <div><b>{d.name}</b><div className="text-xs text-slate-500">{d.phone}</div></div> },
    { h: 'Status', cell: (d) => <Badge s={d.status} /> },
    { h: 'Vehicle', hide: true, cell: (d, db) => db.vehicles.find((v) => v.id === d.vehicleId)?.plate ?? '—' },
    { h: 'Rating', cell: (d) => `★ ${d.rating}` },
    { h: 'On-time', hide: true, cell: (d) => `${d.onTime}%` },
  ],
  statuses: ['available', 'on-trip', 'off-duty'], locKeys: ['location'],
  detail: (d, db) => (
    <div className="space-y-3 text-sm">
      <p><Badge s={d.status} /> {d.phone} · {d.location} · Vehicle: <b>{db.vehicles.find((v) => v.id === d.vehicleId)?.plate ?? 'none'}</b></p>
      <div className="grid grid-cols-3 gap-2 text-center">{[['Rating', d.rating], ['On-time', d.onTime + '%'], ['Deliveries', d.deliveries]].map(([k, v]) => <div key={k} className="rounded-lg bg-slate-50 p-2"><div className="text-lg font-semibold">{v}</div><div className="text-xs text-slate-500">{k}</div></div>)}</div>
      <h4 className="font-semibold">Delivery history</h4>
      <ul className="list-inside list-disc text-slate-600">{db.shipments.filter((s) => s.driverId === d.id).map((s) => <li key={s.id}>{s.id}: {s.pickup} → {s.delivery} ({s.status})</li>)}</ul>
    </div>),
}
export default () => <CrudPage c={c} />
