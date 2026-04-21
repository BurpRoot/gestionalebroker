import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, Car, Building2, UserCheck,
  FileText, Wallet, Package, CalendarClock, CheckSquare,
  Upload, Settings, X
} from 'lucide-react'
import { useAuthStore } from '../../store/auth.store'
import { useUIStore } from '../../store/ui.store'

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/cases', icon: FileText, label: 'Pratiche' },
  { to: '/customers', icon: Users, label: 'Clienti' },
  { to: '/vehicles', icon: Car, label: 'Veicoli' },
  { to: '/partners', icon: Building2, label: 'Partner' },
  { to: '/collaborators', icon: UserCheck, label: 'Collaboratori' },
  { divider: true },
  { to: '/cash', icon: Wallet, label: 'Prima nota cassa' },
  { to: '/payment-batches', icon: Package, label: 'Pagamenti multipli' },
  { divider: true },
  { to: '/deadlines', icon: CalendarClock, label: 'Scadenziario' },
  { to: '/tasks', icon: CheckSquare, label: 'Task' },
  { divider: true },
  { to: '/import', icon: Upload, label: 'Import Excel', roles: ['ADMIN', 'OPERATORE'] },
  { to: '/settings/users', icon: Settings, label: 'Impostazioni', roles: ['ADMIN'] },
]

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore()
  const { sidebarOpen, setSidebarOpen } = useUIStore()

  const filtered = nav.filter((item) => {
    if ('divider' in item) return true
    if (item.roles && user?.role && !item.roles.includes(user.role)) return false
    return true
  })

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-30 flex flex-col bg-slate-900 text-slate-100 transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}
        style={{ width: 240, minWidth: 240 }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700">
          <div>
            <div className="text-sm font-bold text-white leading-tight">Gestionale</div>
            <div className="text-xs text-slate-400">Broker Assicurativo</div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded hover:bg-slate-700 cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {filtered.map((item, i) => {
            if ('divider' in item) return <div key={i} className="border-t border-slate-700/50 my-2" />
            const Icon = item.icon!
            return (
              <NavLink
                key={item.to}
                to={item.to!}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer
                  ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
                }
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* User */}
        {user && (
          <div className="px-4 py-3 border-t border-slate-700">
            <div className="text-xs text-slate-400">{user.firstName} {user.lastName}</div>
            <div className="text-xs text-slate-500">{user.role}</div>
          </div>
        )}
      </aside>
    </>
  )
}
