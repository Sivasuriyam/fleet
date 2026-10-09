import { FormEvent, useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ALERT_ICON, ALERT_ROUTE, useData } from '../store'
import { inp } from './ui'

const nav = [['/', 'Dashboard', '📊'], ['/vehicles', 'Vehicles', '🚛'], ['/drivers', 'Drivers', '🧑‍✈️'], ['/shipments', 'Shipments', '📦'], ['/tracking', 'Tracking', '🗺️'], ['/search', 'Search', '🔍'], ['/notifications', 'Notifications', '🔔']]
const link = ({ isActive }: { isActive: boolean }) => `flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-linear-to-r from-indigo-600 to-indigo-500 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:translate-x-0.5'}`

export default function Layout() {
  const { alerts, unread, read, markRead } = useData(), { pathname } = useLocation(), go = useNavigate(), [open, setOpen] = useState(false), [q, setQ] = useState('')
  useEffect(() => setOpen(false), [pathname])
  const find = (e: FormEvent) => { e.preventDefault(); go(`/search?q=${encodeURIComponent(q)}`) }
  const links = nav.map(([to, l, ic]) => <NavLink key={to} to={to} end={to === '/'} className={link}><span>{ic}</span>{l}{to === '/notifications' && unread > 0 && <span className="ml-auto rounded-full bg-red-500 px-1.5 text-xs text-white">{unread}</span>}</NavLink>)
  return (
    <div className="min-h-screen md:flex">
      <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white p-4 md:block">
        <div className="mb-6 flex items-center gap-2 text-xl font-bold"><span className="grid h-9 w-9 place-items-center rounded-xl bg-linear-to-br from-indigo-500 to-indigo-700 text-lg shadow-lg">🚚</span><span className="text-slate-800">FleetOps</span></div>
        <nav className="flex flex-col gap-1">{links}</nav>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="font-bold text-indigo-600 md:hidden">🚚 FleetOps</span>
            <form onSubmit={find} className="hidden flex-1 md:block md:max-w-sm"><input className={`${inp} !rounded-full`} placeholder="🔍 Search fleet, drivers, shipments…" value={q} onChange={(e) => setQ(e.target.value)} /></form>
            <div className="flex items-center gap-2">
              <div className="relative">
                <button aria-label="Notifications" onClick={() => setOpen(!open)} className="bell relative rounded-full p-2 hover:bg-slate-100">🔔
                  {unread > 0 && <span className="absolute -right-0.5 -top-0.5 rounded-full bg-red-500 px-1.5 text-xs text-white">{unread}</span>}</button>
                {open && <div className="pop absolute right-0 mt-2 max-h-96 w-80 max-w-[85vw] overflow-y-auto rounded-2xl bg-white p-3 shadow-xl ring-1 ring-slate-200">
                  <div className="mb-2 flex items-center justify-between"><h3 className="font-semibold">Notifications</h3><button disabled={!unread} onClick={() => markRead(alerts.map((a) => a.id))} className="text-xs text-indigo-600 disabled:opacity-40">Mark all read</button></div>
                  {alerts.length ? alerts.slice(0, 6).map((a) => (
                    <button key={a.id} onClick={() => { markRead([a.id]); go(ALERT_ROUTE[a.type]) }} className={`mb-1 flex w-full gap-2 rounded-lg p-2 text-left text-sm hover:bg-slate-100 ${read.includes(a.id) ? 'opacity-60' : ''}`}><span>{ALERT_ICON[a.type]}</span><span><b>{a.type}</b> {a.msg}</span></button>)) : <p className="text-sm text-slate-500">Nothing new.</p>}
                  <NavLink to="/notifications" className="mt-2 block rounded-lg bg-slate-100 py-2 text-center text-sm font-medium text-indigo-600">View all alerts</NavLink></div>}
              </div>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-2 md:hidden">{links}</nav>
        </header>
        <main className="p-4 md:p-6"><div key={pathname} className="page"><Outlet /></div></main>
      </div>
    </div>
  )
}
