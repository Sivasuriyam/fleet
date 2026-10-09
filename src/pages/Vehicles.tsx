import CrudPage, { Cfg, opts } from '../components/CrudPage'
import { Badge } from '../components/ui'
import { CITIES } from '../lib/geo'
import { Vehicle } from '../types'

const c: Cfg<Vehicle> = {
  kind: 'vehicles', title: 'Vehicles', prefix: 'VH', dateKey: 'nextService', dateLabel: 'Service from',
  blank: { id: '', plate: '', model: '', status: 'idle', driverId: '', fuel: 100, nextService: '', location: 'Chicago', history: [] },
  fields: [
    { k: 'plate', label: 'Plate', req: true }, { k: 'model', label: 'Model', req: true },
    { k: 'status', label: 'Status', type: 'select', options: opts(['active', 'idle', 'maintenance']) },
    { k: 'driverId', label: 'Driver', type: 'select', options: (db) => [['', 'Unassigned'], ...db.drivers.map((d): [string, string] => [d.id, d.name])] },
    { k: 'fuel', label: 'Fuel %', type: 'number', min: 0, max: 100, req: true },
    { k: 'nextService', label: 'Next service', type: 'date', req: true },
    { k: 'location', label: 'Location', type: 'select', options: opts(Object.keys(CITIES)) },
  ],
  cols: [
    { h: 'Vehicle', cell: (v) => <div><b>{v.plate}</b><div className="text-xs text-slate-500">{v.model}</div></div> },
    { h: 'Status', cell: (v) => <Badge s={v.status} /> },
    { h: 'Driver', hide: true, cell: (v, db) => db.drivers.find((d) => d.id === v.driverId)?.name ?? '—' },
    { h: 'Fuel', cell: (v) => <span className={v.fuel < 20 ? 'font-semibold text-red-600' : ''}>{v.fuel}%</span> },
    { h: 'Next service', hide: true, cell: (v) => v.nextService },
    { h: 'Location', hide: true, cell: (v) => v.location },
  ],
  statuses: ['active', 'idle', 'maintenance'], locKeys: ['location'],
  validate: (v, db) => (db.vehicles.some((x) => x.id !== v.id && x.plate.toLowerCase() === v.plate.trim().toLowerCase()) ? { plate: 'Plate already exists' } : ({} as Record<string, string>)),
  detail: (v, db) => (
    <div className="space-y-3 text-sm">
      <p><Badge s={v.status} /> {v.model} · {v.plate} · {v.location}</p>
      <p>Driver: <b>{db.drivers.find((d) => d.id === v.driverId)?.name ?? 'Unassigned'}</b> · Fuel: <b>{v.fuel}%</b> · Next service: <b>{v.nextService}</b></p>
      <div><h4 className="mb-1 font-semibold">Activity history</h4><ul className="list-inside list-disc text-slate-600">{v.history.map((h) => <li key={h}>{h}</li>)}
        {db.shipments.filter((s) => s.vehicleId === v.id).map((s) => <li key={s.id}>{s.id}: {s.pickup} → {s.delivery} ({s.status})</li>)}</ul></div>
    </div>),
}
export default () => <CrudPage c={c} />
