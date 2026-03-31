"use client";

import { useState, useEffect, useCallback } from "react";
import StatsCards from "./StatsCards";
import ExpenseChart from "./ExpenseChart";
import CategoryBreakdown from "./CategoryBreakdown";
import ExpenseTable from "./ExpenseTable";
import UploadReceipt from "./UploadReceipt";
import { DashboardStats, ExpenseWithItems } from "@/types";

type Period = "week" | "month" | "year";
type Tab = "dashboard" | "upload";

const periodLabels: Record<Period, string> = {
  week: "Semana",
  month: "Mês",
  year: "Ano",
};

const emptyStats: DashboardStats = {
  totalMonth: 0,
  totalWeek: 0,
  dailyAverage: 0,
  biggestExpense: 0,
  totalReceipts: 0,
  categoryBreakdown: [],
  dailyExpenses: [],
};

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [period, setPeriod] = useState<Period>("month");
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [expenses, setExpenses] = useState<ExpenseWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/expenses?period=" + period);
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
      if (data && data.stats) {
        setStats(data.stats);
        setExpenses(data.expenses || []);
      } else {
        setStats(emptyStats);
        setExpenses([]);
      }
    } catch {
      setStats(emptyStats);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold gradient-text">
              Neagle
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Dashboard de Gastos Inteligente
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switcher */}
            <div className="flex items-center bg-dark-700 rounded-lg p-1 mr-2">
              <button
                onClick={() => setTab("dashboard")}
                className={"flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all " + (
                  tab === "dashboard"
                    ? "bg-dark-500 text-neon-cyan shadow-sm"
                    : "text-gray-400 hover:text-gray-200"
                )}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                </svg>
                Dashboard
              </button>
              <button
                onClick={() => setTab("upload")}
                className={"flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all " + (
                  tab === "upload"
                    ? "bg-dark-500 text-neon-magenta shadow-sm"
                    : "text-gray-400 hover:text-gray-200"
                )}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                Adicionar
              </button>
            </div>
          </div>
        </div>

        {/* Receipts counter */}
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
          <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse-neon" />
          {stats.totalReceipts} nota(s) processada(s) &middot; Atualiza a cada
          30s
        </div>
      </header>

      {tab === "dashboard" ? (
        <>
          {/* Period filter + refresh */}
          <div className="flex items-center gap-2 mb-6">
            {(Object.keys(periodLabels) as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={"px-4 py-2 rounded-lg text-sm font-medium transition-all " + (
                  period === p
                    ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30"
                    : "text-gray-400 hover:text-gray-200 hover:bg-dark-600"
                )}
              >
                {periodLabels[p]}
              </button>
            ))}
            <button
              onClick={fetchData}
              className="ml-2 p-2 rounded-lg text-gray-400 hover:text-neon-cyan hover:bg-dark-600 transition-all"
              title="Atualizar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={loading ? "animate-spin" : ""}
              >
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 16h5v5" />
              </svg>
            </button>
          </div>

          {/* Stats Cards */}
          <section className="mb-6">
            <StatsCards stats={stats} />
          </section>

          {/* Charts */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <ExpenseChart data={stats.dailyExpenses} />
            </div>
            <div>
              <CategoryBreakdown data={stats.categoryBreakdown} />
            </div>
          </section>

          {/* Table */}
          <section>
            <ExpenseTable expenses={expenses} />
          </section>
        </>
      ) : (
        /* Upload tab */
        <section className="max-w-xl mx-auto">
          <UploadReceipt onSuccess={fetchData} />
        </section>
      )}

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-gray-600 pb-4">
        Envie uma foto da nota fiscal pelo WhatsApp ou pela aba Adicionar
      </footer>
    </div>
  );
}
