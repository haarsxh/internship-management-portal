import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'

const STATUS_COLORS = { applied: '#2997ff', shortlisted: '#ff9f0a', accepted: '#34c759', rejected: '#ff3b30' }
const ACCENT = '#0071e3'

function ChartCard({ title, empty, children }) {
  return (
    <div className="rounded-xl bg-white p-5">
      <h3 className="mb-3 font-semibold">{title}</h3>
      <div className="h-64">
        {empty ? <p className="flex h-full items-center justify-center text-sm text-slate-400">No data yet</p> : children}
      </div>
    </div>
  )
}

const shortDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
const tooltipStyle = { borderRadius: 12, border: '1px solid #e8e8ed', fontSize: 13 }

export function ApplicationsOverTime({ data }) {
  return (
    <ChartCard title="Applications, last 14 days" empty={data.every((d) => d.count === 0)}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="appsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ACCENT} stopOpacity={0.3} />
              <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8e8ed" vertical={false} />
          <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 11 }} interval={2} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip labelFormatter={shortDate} contentStyle={tooltipStyle} formatter={(v) => [v, 'Applications']} />
          <Area type="monotone" dataKey="count" stroke={ACCENT} strokeWidth={2} fill="url(#appsFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export function StatusPie({ counts }) {
  const data = Object.entries(counts).map(([name, value]) => ({ name, value }))
  return (
    <ChartCard title="Applications by status" empty={data.length === 0}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2} stroke="none">
            {data.map((d) => (
              <Cell key={d.name} fill={STATUS_COLORS[d.name] || '#86868b'} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend iconType="circle" formatter={(v) => <span className="text-sm capitalize">{v}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export function HorizontalBars({ title, rows, labelKey, valueKey, valueLabel }) {
  return (
    <ChartCard title={title} empty={rows.length === 0}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8e8ed" horizontal={false} />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey={labelKey} width={110} tick={{ fontSize: 11 }} tickFormatter={(v) => (v.length > 16 ? `${v.slice(0, 15)}…` : v)} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, valueLabel]} cursor={{ fill: '#f5f5f7' }} />
          <Bar dataKey={valueKey} fill={ACCENT} radius={[0, 6, 6, 0]} barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
