"use client";

import dynamic from "next/dynamic";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ExpenseChartProps {
  data: { date: string; total: number }[];
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card glow-cyan px-4 py-2">
      <p className="text-gray-400 text-xs">{label}</p>
      <p className="text-neon-cyan font-bold">
        R$ {payload[0].value.toFixed(2)}
      </p>
    </div>
  );
}

function ExpenseChartInner({ data }: ExpenseChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    }),
  }));

  return (
    <div className="glass-card glow-cyan p-6 animate-fade-in">
      <h2 className="text-lg font-semibold mb-4 text-gray-200">
        Gastos Diários
      </h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formatted}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f5d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00f5d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e30" />
            <XAxis
              dataKey="date"
              stroke="#4a4a6a"
              tick={{ fill: "#6a6a8a", fontSize: 12 }}
            />
            <YAxis
              stroke="#4a4a6a"
              tick={{ fill: "#6a6a8a", fontSize: 12 }}
              tickFormatter={(v) => `R$${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#00f5d4"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorTotal)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(ExpenseChartInner), {
  ssr: false,
  loading: () => (
    <div className="glass-card glow-cyan p-6 animate-fade-in">
      <h2 className="text-lg font-semibold mb-4 text-gray-200">Gastos Diários</h2>
      <div className="h-64 flex items-center justify-center text-gray-500">Carregando gráfico...</div>
    </div>
  ),
});
