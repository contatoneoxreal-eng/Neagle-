"use client";

import dynamic from "next/dynamic";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { categoryLabels, categoryColors, formatCurrency } from "@/lib/utils";

interface CategoryBreakdownProps {
  data: { category: string; total: number }[];
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { fill: string } }[];
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-4 py-2" style={{ borderColor: payload[0].payload.fill }}>
      <p className="text-gray-400 text-xs">{payload[0].name}</p>
      <p className="font-bold" style={{ color: payload[0].payload.fill }}>
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

function CategoryBreakdownInner({ data }: CategoryBreakdownProps) {
  const chartData = data.map((d) => ({
    name: categoryLabels[d.category] || d.category,
    value: d.total,
    fill: categoryColors[d.category] || "#6c757d",
  }));

  return (
    <div className="glass-card glow-purple p-6 animate-fade-in">
      <h2 className="text-lg font-semibold mb-4 text-gray-200">
        Por Categoria
      </h2>
      <div className="h-64">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 text-sm">
            Sem dados de categorias
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-3 mt-2 justify-center">
        {chartData.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5 text-xs">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.fill }}
            />
            <span className="text-gray-400">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(CategoryBreakdownInner), {
  ssr: false,
  loading: () => (
    <div className="glass-card glow-purple p-6 animate-fade-in">
      <h2 className="text-lg font-semibold mb-4 text-gray-200">Por Categoria</h2>
      <div className="h-64 flex items-center justify-center text-gray-500">Carregando gráfico...</div>
    </div>
  ),
});
