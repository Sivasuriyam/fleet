import { DB, Kind } from '../types'
import { seed } from './seed'

type Row = { id: string }
const db: DB = structuredClone(seed)
const wait = <T,>(v: T, ms = 400) => new Promise<T>((res) => setTimeout(() => res(v), ms))

/** Mock API. Replace each body with fetch('/api/...') calls – signatures stay the same. */
export const api = {
  load: () => wait(structuredClone(db)),
  save: (k: Kind, item: Row) => {
    const l = db[k] as Row[], i = l.findIndex((x) => x.id === item.id)
    if (i < 0) l.push(item); else l[i] = item
    return wait(item, 250)
  },
  remove: (k: Kind, id: string) => {
    (db as unknown as Record<string, Row[]>)[k] = (db[k] as Row[]).filter((x) => x.id !== id)
    return wait(id, 250)
  },
}
