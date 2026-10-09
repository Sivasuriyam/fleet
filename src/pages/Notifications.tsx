import { CSSProperties, useState } from 'react'
import { Link } from 'react-router-dom'
import { Btn, Card, Empty, ErrorBox, inp, Loading } from '../components/ui'
import { ALERT_ICON, ALERT_ROUTE, useData } from '../store'
import { Alert } from '../types'

const TYPES = Object.keys(ALERT_ICON) as Alert['type'][]

/** Notification & alert centre: filter, mark read, dismiss, and choose which alert types to receive. */
export default function Notifications() {
  const { db, error, reload, alerts, read, markRead, dismiss, restore, dismissedCount, muted, toggleMute, unread } = useData()
  const [tab, setTab] = useState('all'), [lvl, setLvl] = useState(''), [q, setQ] = useState('')
  if (error) return <ErrorBox msg={error} retry={reload} />
  if (!db) return <Loading />
  const isNew = (a: Alert) => !read.includes(a.id)
  const inTab = (a: Alert, t: string) => t === 'all' || (t === 'unread' ? isNew(a) : a.type === t)
  const rows = alerts.filter((a) => inTab(a, tab) && (!lvl || a.level === lvl) && (!q || a.msg.toLowerCase().includes(q.toLowerCase())))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Notifications & alerts</h1>
        <div className="flex gap-2"><Btn v="ghost" disabled={!unread} onClick={() => markRead(alerts.map((a) => a.id))}>Mark all read</Btn><Btn v="ghost" disabled={!dismissedCount} onClick={restore}>Restore dismissed ({dismissedCount})</Btn></div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="space-y-3">
          <Card className="space-y-3">
            <div className="flex flex-wrap gap-2">{['all', 'unread', ...TYPES].map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`rounded-full px-3 py-1 text-sm font-medium capitalize transition ${tab === t ? 'bg-linear-to-r from-indigo-600 to-indigo-500 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {t !== 'all' && t !== 'unread' && ALERT_ICON[t as Alert['type']]} {t} <span className="opacity-70">{alerts.filter((a) => inTab(a, t)).length}</span></button>))}</div>
            <div className="flex gap-2"><input className={inp} placeholder="Filter notifications…" value={q} onChange={(e) => setQ(e.target.value)} />
              <select className={`${inp} !w-auto`} value={lvl} onChange={(e) => setLvl(e.target.value)}><option value="">All severity</option><option value="high">High</option><option value="info">Info</option></select></div>
          </Card>
          {!rows.length ? <Card><Empty text={alerts.length ? 'Nothing matches these filters.' : "You're all caught up 🎉"} /></Card> : rows.map((a, i) => (
            <div key={a.id} style={{ '--i': i } as CSSProperties} className={`rise flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 transition ${isNew(a) ? 'ring-indigo-500/40' : 'opacity-70 ring-slate-200'}`}>
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${a.level === 'high' ? 'bg-red-100' : 'bg-blue-100'}`}>{ALERT_ICON[a.type]}</span>
              <div className="min-w-0 flex-1"><p className="text-sm"><b>{a.type}</b> {isNew(a) && <i className="ml-1 inline-block h-2 w-2 rounded-full bg-indigo-500" />}</p><p className="text-sm text-slate-600">{a.msg}</p>
                <span className={`text-xs font-medium ${a.level === 'high' ? 'text-red-600' : 'text-blue-600'}`}>{a.level === 'high' ? 'High priority' : 'Info'}</span></div>
              <div className="flex shrink-0 flex-wrap justify-end gap-1">
                <Link to={ALERT_ROUTE[a.type]} onClick={() => markRead([a.id])} className="rounded-lg px-2 py-1 text-sm text-indigo-600 hover:bg-slate-100">View</Link>
                {isNew(a) && <Btn v="ghost" onClick={() => markRead([a.id])}>Read</Btn>}<Btn v="danger" onClick={() => dismiss(a.id)}>Dismiss</Btn></div>
            </div>))}
        </div>
        <Card title="Alert preferences" className="h-fit">
          <p className="mb-3 text-xs text-slate-500">Choose which alerts appear in the bell, dashboard and this list.</p>
          {TYPES.map((t) => (
            <div key={t} className="flex items-center justify-between py-2 text-sm"><span>{ALERT_ICON[t]} {t === 'Delay' ? 'Delayed shipments' : t === 'Maintenance' ? 'Vehicle maintenance' : t === 'Delivery' ? 'Delivery updates' : 'Driver status'}</span>
              <button role="switch" aria-checked={!muted.includes(t)} aria-label={`Toggle ${t} alerts`} onClick={() => toggleMute(t)} className={`relative h-6 w-11 rounded-full transition ${muted.includes(t) ? 'bg-slate-300' : 'bg-indigo-600'}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${muted.includes(t) ? 'left-0.5' : 'left-[22px]'}`} /></button></div>))}
        </Card>
      </div>
    </div>
  )
}
