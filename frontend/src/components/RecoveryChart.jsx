import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const COLORS = ['#2563EB', '#60A5FA', '#10B981', '#F59E0B', '#EF4444', '#94A3B8'];

export default function RecoveryChart({ type = 'bar', data = [], xKey = 'name', yKeys = ['value'], height = 300 }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 border border-dashed border-[#1E293B] rounded-lg text-xs text-[#64748B]">
        No chart data available
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        {type === 'area' ? (
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAtRisk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis dataKey={xKey} stroke="#64748B" fontSize={11} />
            <YAxis stroke="#64748B" fontSize={11} />
            <Tooltip
              contentStyle={{ backgroundColor: '#171E2E', borderColor: '#1E293B', borderRadius: '8px', fontSize: '12px', color: '#F8FAFC' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Area type="monotone" dataKey={yKeys[0] || 'atRisk'} name="Revenue at Risk (₹)" stroke="#EF4444" fillOpacity={1} fill="url(#colorAtRisk)" />
            {yKeys[1] && (
              <Area type="monotone" dataKey={yKeys[1]} name="Revenue Recovered (₹)" stroke="#10B981" fillOpacity={1} fill="url(#colorRecovered)" />
            )}
          </AreaChart>
        ) : type === 'pie' ? (
          <PieChart>
            <Pie
              data={data}
              dataKey={yKeys[0] || 'value'}
              nameKey={xKey}
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={50}
              paddingAngle={4}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#171E2E', borderColor: '#1E293B', borderRadius: '8px', fontSize: '12px', color: '#F8FAFC' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
          </PieChart>
        ) : (
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis dataKey={xKey} stroke="#64748B" fontSize={11} />
            <YAxis stroke="#64748B" fontSize={11} />
            <Tooltip
              contentStyle={{ backgroundColor: '#171E2E', borderColor: '#1E293B', borderRadius: '8px', fontSize: '12px', color: '#F8FAFC' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            {yKeys.map((key, index) => (
              <Bar key={key} dataKey={key} fill={COLORS[index % COLORS.length]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
