"use client";

import { formatCurrency } from "@/lib/utils";
import { DashboardStats } from "@/types";

interface StatsCardsProps {
  stats: DashboardStats;
}

const cards = [
  {
    key: "totalMonth" as const,
    label: "Total do Mês",
    icon: "📊",
    glow: "glow-cyan",
    color: "text-neon-cyan",
  },
  {
    key: "totalWeek" as const,
    label: "Última Semana",
    icon: "📅",
    glow: "glow-purple",
    color: "text-neon-purple",
  },
  {
    key: "dailyAverage" as const,
    label: "Média Diária",
    icon: "📈",
    glow: "glow-magenta",
    color: "text-neon-magenta",
  },
  {
    key: "biggestExpense" as const,
    label: "Maior Gasto",
    icon: "🔥",
    glow: "glow-yellow",
    color: "text-neon-yellow",
  },
];

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div
          key={card.key}
          className={`glass-card ${card.glow} p-6 animate-slide-up`}
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">{card.label}</span>
            <span className="text-2xl">{card.icon}</span>
          </div>
          <p className={`text-2xl font-bold ${card.color} font-[family-name:var(--font-geist-mono)]`}>
            {formatCurrency(stats[card.key])}
          </p>
        </div>
      ))}
    </div>
  );
}
