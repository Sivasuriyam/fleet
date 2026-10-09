import CrudPage, { Cfg, opts } from '../components/CrudPage'
import { Badge } from '../components/ui'
import { CITIES, isoDate } from '../lib/geo'
import { Shipment } from '../types'

const cities = Object.keys(CITIES)
const c: Cfg<Shipment> = {
  kind: 'shipments', title: 'Shipments', prefix: 'SH', dateKey: 'date', dateLabel: 'Shipped from',
  blank: { id: '', customer: '', pickup: 'Chicago', delivery: 'Dallas', driverId: '', vehicleId: '', status: 'pending', date: isoDate(0), eta: isoDate(3), progress: 0 },
  fields: [
    { k: 'customer', label: 'Customer', req: true },
    { k: 'status', label: 'Status', type: 'select', options: opts(['pending', 'in-transit', 'delivered', 'delayed']) },
    { k: 'pickup', label: 'Pickup', type: 'select', options: opts(cities) }, { k: 'delivery', label: 'Delivery', type: 'select', options: opts(cities) },
    { k: 'driverId', label: 'Driver', type: 'select', options: (db) => [['', 'Unassigned'], ...db.drivers.map((d): [string, string] => [d.id, d.name])] },
    { k: 'vehicleId', label: 'Vehicle', type: 'select', options: (db) => [['', 'Unassigned'], ...db.vehicles.map((v): [string, string] => [v.id, v.plate])] },
    { k: 'date', label: 'Ship date', type: 'date', req: true }, { k: 'eta', label: 'ETA', type: 'date', req: true },
    { k: 'progress', label: 'Progress (0-1)', type: 'number', min: 0, max: 1, req: true },
  ],
  cols: [
    { h: 'Shipment', cell: (s) => <div><b>{s.id}</b><div className="text-xs text-slate-500">{s.customer}</div></div> },
    { h: 'Route', cell: (s) => `${s.pickup} → ${s.delivery}` },
    { h: 'Status', cell: (s) => <Badge s={s.status} /> },
    { h: 'Driver', hide: true, cell: (s, db) => db.drivers.find((d) => d.id === s.driverId)?.name ?? '—' },
    { h: 'ETA', hide: true, cell: (s) => s.eta },
  ],
  statuses: ['pending', 'in-transit', 'delivered', 'delayed'], locKeys: ['pickup', 'delivery'],
  validate: (s) => ({ ...(s.pickup === s.delivery ? { delivery: 'Must differ from pickup' } : {}), ...(s.eta < s.date ? { eta: 'ETA is before ship date' } : {}) }),
  detail: (s, db) => (
    <div className="space-y-3 text-sm">
      <p><Badge s={s.status} /> {s.customer}</p>
      <p>{s.pickup} → {s.delivery} · Driver: <b>{db.drivers.find((d) => d.id === s.driverId)?.name ?? '—'}</b> · Vehicle: <b>{db.vehicles.find((v) => v.id === s.vehicleId)?.plate ?? '—'}</b></p>
      <h4 className="font-semibold">Delivery history</h4>
      <ol className="list-inside list-decimal text-slate-600"><li>Created {s.date}</li>{s.status !== 'pending' && <li>Picked up in {s.pickup}</li>}
        {s.status === 'delayed' && <li>Delayed – revised ETA {s.eta}</li>}{s.status === 'delivered' && <li>Delivered in {s.delivery} on {s.eta}</li>}</ol>
    </div>),
}
export default () => <CrudPage c={c} />
