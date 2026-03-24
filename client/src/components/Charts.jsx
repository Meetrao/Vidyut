import React from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(1, 22, 22, 0.95)',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        borderRadius: 12,
        padding: '12px 16px',
        fontSize: 13,
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      }}>
        <p style={{ color: '#94a3b8', marginBottom: 6, fontSize: 12 }}>{label}</p>
        {payload.map((entry) => (
          <p key={entry.dataKey} style={{ color: entry.color, fontWeight: 600 }}>
            {entry.name}: {unit === 'currency' ? '₹' : ''}{Number(entry.value).toLocaleString('en-IN', { maximumFractionDigits: 1 })}{unit === 'kwh' ? ' kWh' : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function UsageLineChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38bdf8"/>
            <stop offset="100%" stopColor="#818cf8"/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} />
        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
        <Tooltip content={<CustomTooltip unit="kwh" />} />
        <Legend wrapperStyle={{ fontSize: 13, color: '#94a3b8' }} />
        <Line
          type="monotone"
          dataKey="units"
          name="Units (kWh)"
          stroke="url(#lineGradient)"
          strokeWidth={2.5}
          dot={{ fill: '#38bdf8', strokeWidth: 0, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function UsageCostChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818cf8" stopOpacity={0.9}/>
            <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.7}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} />
        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
        <Tooltip content={<CustomTooltip unit="currency" />} />
        <Legend wrapperStyle={{ fontSize: 13, color: '#94a3b8' }} />
        <Bar dataKey="cost" name="Cost (₹)" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
