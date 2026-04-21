import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../../api/dashboard'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { TrendingUp, TrendingDown, FileText, AlertTriangle, Clock, CheckSquare } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { PageLoader } from '../../components/ui/Spinner'
import { CASE_STATUS_COLORS, CASE_STATUS_LABELS } from '../../types'

const fmt = (n: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

const KpiCard: React.FC<{
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  color?: string
}> = ({ title, value, subtitle, icon, color = '#3b82f6' }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
    <div className="flex items-start justify-between mb-3">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}15` }}>
        <div style={{ color }}>{icon}</div>
      </div>
    </div>
    <div className="text-2xl font-bold text-slate-900">{value}</div>
    {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
  </div>
)

export const DashboardPage: React.FC = () => {
  const { data: kpis, isLoading: kpiLoading } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: dashboardApi.kpis,
    refetchInterval: 5 * 60 * 1000,
  })

  const { data: trend } = useQuery({
    queryKey: ['dashboard-trend'],
    queryFn: dashboardApi.revenueTrend,
  })

  const { data: byStatus } = useQuery({
    queryKey: ['dashboard-status'],
    queryFn: dashboardApi.casesByStatus,
  })

  const { data: topPartners } = useQuery({
    queryKey: ['dashboard-partners'],
    queryFn: dashboardApi.topPartners,
  })

  const { data: topCollabs } = useQuery({
    queryKey: ['dashboard-collabs'],
    queryFn: dashboardApi.topCollaborators,
  })

  if (kpiLoading) return <PageLoader />

  const k = kpis || {}

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Entrate mese"
          value={fmt(k.entrateMonth || 0)}
          subtitle={`YTD: ${fmt(k.entrateYear || 0)}`}
          icon={<TrendingUp size={18} />}
          color="#22c55e"
        />
        <KpiCard
          title="Uscite mese"
          value={fmt(k.usciteMonth || 0)}
          subtitle={`YTD: ${fmt(k.usciteYear || 0)}`}
          icon={<TrendingDown size={18} />}
          color="#ef4444"
        />
        <KpiCard
          title="Margine mese"
          value={fmt(k.margineMonth || 0)}
          subtitle={`YTD: ${fmt(k.margineYear || 0)}`}
          icon={<TrendingUp size={18} />}
          color="#3b82f6"
        />
        <KpiCard
          title="Pratiche aperte"
          value={k.openCases || 0}
          subtitle={`${k.monthCases || 0} questo mese`}
          icon={<FileText size={18} />}
          color="#8b5cf6"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Scadenze settimana"
          value={k.expiringWeek || 0}
          icon={<Clock size={18} />}
          color="#f59e0b"
        />
        <KpiCard
          title="Task aperti"
          value={k.openTasks || 0}
          icon={<CheckSquare size={18} />}
          color="#06b6d4"
        />
        <KpiCard
          title="Anomalie (att. doc)"
          value={k.anomalyCases || 0}
          icon={<AlertTriangle size={18} />}
          color="#ef4444"
        />
        <KpiCard
          title="Pratiche totali"
          value={k.totalCases || 0}
          icon={<FileText size={18} />}
          color="#64748b"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <Card className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Andamento entrate/uscite (12 mesi)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trend || []} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => fmt(v)} />
              <Bar dataKey="entrate" name="Entrate" fill="#22c55e" radius={[3, 3, 0, 0]} />
              <Bar dataKey="uscite" name="Uscite" fill="#ef4444" radius={[3, 3, 0, 0]} />
              <Bar dataKey="margine" name="Margine" fill="#3b82f6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Cases by status */}
        <Card>
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Pratiche per stato</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={byStatus || []} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={75} label={false}>
                {(byStatus || []).map((entry: any) => (
                  <Cell key={entry.status} fill={CASE_STATUS_COLORS[entry.status as keyof typeof CASE_STATUS_COLORS] || '#94a3b8'} />
                ))}
              </Pie>
              <Legend
                formatter={(v: any) => CASE_STATUS_LABELS[v as keyof typeof CASE_STATUS_LABELS] || v}
                wrapperStyle={{ fontSize: 11 }}
              />
              <Tooltip formatter={(v: any, name: any) => [v, CASE_STATUS_LABELS[name as keyof typeof CASE_STATUS_LABELS] || name]} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Top Partner per pratiche</h3>
          <div className="space-y-2">
            {(topPartners || []).map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-slate-700">{p.partnerName}</span>
                <span className="text-sm font-semibold text-blue-600">{p.count}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Top Collaboratori per pratiche</h3>
          <div className="space-y-2">
            {(topCollabs || []).map((c: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-slate-700">{c.name}</span>
                <span className="text-sm font-semibold text-blue-600">{c.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
