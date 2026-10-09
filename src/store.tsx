import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from './api'
import { Alert, DB, Kind } from './types'
import { isoDate } from './lib/geo'

type Row = { id: string }
interface Store { db: DB | null; error: string; reload: () => void; save: (k: Kind, i: Row) => Promise<void>; remove: (k: Kind, id: string) => Promise<void>; alerts: Alert[]
  unread: number; read: string[]; markRead: (ids: string[]) => void; dismiss: (id: string) => void; restore: () => void
  dismissedCount: number; muted: string[]; toggleMute: (t: string) => void }
const Ctx = createContext<Store>(null!)
export const useData = () => useContext(Ctx)
export const ALERT_ICON: Record<Alert['type'], string> = { Delay: '⏱️', Maintenance: '🔧', Delivery: '📦', Driver: '🧑‍✈️' }
export const ALERT_ROUTE: Record<Alert['type'], string> = { Delay: '/shipments', Maintenance: '/vehicles', Delivery: '/shipments', Driver: '/drivers' }

/** String-list state persisted to localStorage (read / dismissed / muted notification ids). */
function useStored(key: string): [string[], (f: (l: string[]) => string[]) => void] {
  const [v, setV] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem(key) ?? '[]') } catch { return [] } })
  const set = (f: (l: string[]) => string[]) => setV((p) => { const n = f(p); try { localStorage.setItem(key, JSON.stringify(n)) } catch { /* private mode */ } return n })
  return [v, set]
}

export function makeAlerts(db: DB): Alert[] {
  const a: Alert[] = [], soon = isoDate(14)
  db.shipments.forEach((s) => {
    if (s.status === 'delayed') a.push({ id: 'd' + s.id, type: 'Delay', level: 'high', msg: `${s.id} to ${s.delivery} is delayed (ETA ${s.eta})` })
    if (s.status === 'delivered') a.push({ id: 'v' + s.id, type: 'Delivery', level: 'info', msg: `${s.id} delivered to ${s.customer}` })
  })
  db.vehicles.forEach((v) => {
    if (v.status === 'maintenance') a.push({ id: 'm' + v.id, type: 'Maintenance', level: 'high', msg: `${v.plate} is in maintenance` })
    else if (v.nextService <= soon) a.push({ id: 's' + v.id, type: 'Maintenance', level: 'high', msg: `${v.plate} service due ${v.nextService}` })
    if (v.fuel < 20) a.push({ id: 'f' + v.id, type: 'Maintenance', level: 'high', msg: `${v.plate} fuel low (${v.fuel}%)` })
  })
  db.drivers.forEach((d) => { if (d.status === 'off-duty') a.push({ id: 'o' + d.id, type: 'Driver', level: 'info', msg: `${d.name} is off duty` }) })
  return a
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB | null>(null), [error, setError] = useState(''), [tick, setTick] = useState(0)
  useEffect(() => { setError(''); api.load().then(setDb).catch((e) => setError(String(e))) }, [tick])
  const save = useCallback(async (k: Kind, item: Row) => {
    await api.save(k, item)
    setDb((d) => { if (!d) return d; const l = d[k] as Row[]; const n = l.some((x) => x.id === item.id) ? l.map((x) => (x.id === item.id ? item : x)) : [...l, item]; return { ...d, [k]: n } as DB })
  }, [])
  const remove = useCallback(async (k: Kind, id: string) => {
    await api.remove(k, id)
    setDb((d) => (d ? ({ ...d, [k]: (d[k] as Row[]).filter((x) => x.id !== id) } as DB) : d))
  }, [])
  const [read, setRead] = useStored('fo-read'), [gone, setGone] = useStored('fo-gone'), [muted, setMuted] = useStored('fo-muted')
  const all = useMemo(() => (db ? makeAlerts(db) : []), [db])
  const alerts = useMemo(() => all.filter((a) => !gone.includes(a.id) && !muted.includes(a.type)).sort((a, b) => +(b.level === 'high') - +(a.level === 'high')), [all, gone, muted])
  const unread = alerts.filter((a) => !read.includes(a.id)).length
  const ctx: Store = {
    db, error, reload: () => setTick((t) => t + 1), save, remove, alerts, unread, read, muted, dismissedCount: gone.length,
    markRead: (ids) => setRead((l) => [...new Set([...l, ...ids])]), dismiss: (id) => setGone((l) => [...l, id]), restore: () => setGone(() => []),
    toggleMute: (t) => setMuted((l) => (l.includes(t) ? l.filter((x) => x !== t) : [...l, t])),
  }
  return <Ctx.Provider value={ctx}>{children}</Ctx.Provider>
}
