import { ButtonHTMLAttributes, CSSProperties, ReactNode, useEffect, useState } from 'react'

export const inp = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
const tones: Record<string, string> = {
  active: 'bg-green-100 text-green-700', available: 'bg-green-100 text-green-700', delivered: 'bg-green-100 text-green-700',
  'in-transit': 'bg-blue-100 text-blue-700', 'on-trip': 'bg-blue-100 text-blue-700',
  pending: 'bg-amber-100 text-amber-700', maintenance: 'bg-amber-100 text-amber-700',
  delayed: 'bg-red-100 text-red-700', idle: 'bg-slate-100 text-slate-600', 'off-duty': 'bg-slate-100 text-slate-600',
}
export const Badge = ({ s }: { s: string }) => <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${tones[s] ?? 'bg-slate-100 text-slate-600'}`}>{s}</span>

export const Card = ({ title, children, className = '', i = 0 }: { title?: string; children: ReactNode; className?: string; i?: number }) => (
  <section style={{ '--i': i } as CSSProperties} className={`rise rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 ${className}`}>
    {title && <h2 className="mb-3 font-semibold text-slate-800">{title}</h2>}
    {children}
  </section>
)
const btn = { pri: 'bg-linear-to-r from-indigo-600 to-indigo-500 text-white shadow hover:brightness-110', ghost: 'text-slate-600 hover:bg-slate-100', danger: 'text-red-600 hover:bg-red-50' }
export const Btn = ({ v = 'pri', className = '', ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { v?: keyof typeof btn }) => (
  <button {...p} className={`rounded-lg px-3 py-1.5 text-sm font-medium transition disabled:opacity-50 ${btn[v]} ${className}`} />
)
export const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) => (
  <div className="fade fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
    <div className="pop max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
      <div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-semibold">{title}</h3><Btn v="ghost" onClick={onClose} aria-label="Close">✕</Btn></div>
      {children}
    </div>
  </div>
)
export const Loading = () => <div className="flex justify-center p-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-soft border-t-pri" /></div>
export const ErrorBox = ({ msg, retry }: { msg: string; retry: () => void }) => (
  <Card className="text-center"><p className="mb-3 text-red-600">Something went wrong: {msg}</p><Btn onClick={retry}>Retry</Btn></Card>
)
export const Empty = ({ text }: { text: string }) => <p className="p-10 text-center text-sm text-slate-500">{text}</p>
export const Bar = ({ label, value, max, color = 'bg-indigo-500' }: { label: string; value: number; max: number; color?: string }) => (
  <div className="mb-2"><div className="flex justify-between text-xs text-slate-600"><span className="capitalize">{label}</span><span>{value}</span></div>
    <div className="h-2 rounded bg-slate-100"><div className={`grow h-2 rounded ${color}`} style={{ width: `${max ? (value / max) * 100 : 0}%` }} /></div></div>
)

export function CountUp({ to }: { to: number }) {
  const [v, setV] = useState(0)
  useEffect(() => {
    let r = 0; const t0 = performance.now()
    const f = (t: number) => { const p = Math.min(1, (t - t0) / 900); setV(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) r = requestAnimationFrame(f) }
    r = requestAnimationFrame(f)
    return () => cancelAnimationFrame(r)
  }, [to])
  return <>{v}</>
}
export const Stat = ({ label, value, icon, tone }: { label: string; value: number; icon: string; tone: string }) => (
  <Card className="lift flex items-center gap-3 !p-4">
    <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-xl ${tone}`}>{icon}</span>
    <div><div className="text-xs text-slate-500">{label}</div><div className="text-2xl font-bold"><CountUp to={value} /></div></div>
  </Card>
)
export function Donut({ data, center }: { data: [string, number, string][]; center: string }) {
  const t = data.reduce((a, d) => a + d[1], 0) || 1; let acc = 0
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative h-32 w-32 shrink-0">
        <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90"><circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--color-slate-100)" strokeWidth="4" />
          {data.map(([k, v, c]) => { const p = (v / t) * 100, o = -acc; acc += p
            return <circle key={k} className="seg" cx="18" cy="18" r="15.9155" fill="none" stroke={c} strokeWidth="4" strokeDasharray={`${p} ${100 - p}`} strokeDashoffset={o} /> })}</svg>
        <div className="absolute inset-0 grid place-items-center text-center text-lg font-bold">{center}</div>
      </div>
      <ul className="space-y-1 text-sm">{data.map(([k, v, c]) => <li key={k} className="flex items-center gap-2 capitalize"><i className="h-3 w-3 rounded-full" style={{ background: c }} />{k} <b>{v}</b></li>)}</ul>
    </div>
  )
}

