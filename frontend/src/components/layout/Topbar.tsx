import React from 'react'
import { Menu, LogOut, User } from 'lucide-react'
import { useUIStore } from '../../store/ui.store'
import { useAuthStore } from '../../store/auth.store'
import { authApi } from '../../api/auth'

export const Topbar: React.FC = () => {
  const { toggleSidebar } = useUIStore()
  const { user, clear } = useAuthStore()

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } finally {
      clear()
      window.location.href = '/login'
    }
  }

  return (
    <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer lg:hidden"
        >
          <Menu size={20} />
        </button>
        <span className="text-sm font-medium text-slate-700 hidden sm:block">
          {import.meta.env.VITE_APP_NAME}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {user && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <User size={14} />
            <span className="hidden sm:block">{user.firstName} {user.lastName}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
          title="Logout"
        >
          <LogOut size={14} />
          <span className="hidden sm:block">Esci</span>
        </button>
      </div>
    </header>
  )
}
