"use client";

import { ExpenseWithItems } from "@/types";
import { formatCurrency, formatDate, categoryLabels, categoryColors } from "@/lib/utils";

interface ExpenseTableProps {
  expenses: ExpenseWithItems[];
}

export default function ExpenseTable({ expenses }: ExpenseTableProps) {
  return (
    <div className="glass-card glow-magenta p-6 animate-fade-in">
      <h2 className="text-lg font-semibold mb-4 text-gray-200">
        Últimos Gastos
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-500">
              <th className="text-left py-3 px-2 text-gray-400 font-medium">
                Data
              </th>
              <th className="text-left py-3 px-2 text-gray-400 font-medium">
                Loja
              </th>
              <th className="text-left py-3 px-2 text-gray-400 font-medium">
                Categoria
              </th>
              <th className="text-left py-3 px-2 text-gray-400 font-medium">
                Itens
              </th>
              <th className="text-right py-3 px-2 text-gray-400 font-medium">
                Valor
              </th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  Nenhum gasto registrado ainda. Envie uma nota pelo WhatsApp!
                </td>
              </tr>
            )}
            {expenses.map((expense) => (
              <tr
                key={expense.id}
                className="border-b border-dark-600/50 hover:bg-dark-600/30 transition-colors"
              >
                <td className="py-3 px-2 text-gray-300 font-[family-name:var(--font-geist-mono)]">
                  {formatDate(expense.date)}
                </td>
                <td className="py-3 px-2 text-gray-200">{expense.storeName}</td>
                <td className="py-3 px-2">
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${categoryColors[expense.category]}15`,
                      color: categoryColors[expense.category],
                      border: `1px solid ${categoryColors[expense.category]}30`,
                    }}
                  >
                    {categoryLabels[expense.category]}
                  </span>
                </td>
                <td className="py-3 px-2 text-gray-400">
                  {expense.items.length} item(ns)
                </td>
                <td className="py-3 px-2 text-right text-neon-cyan font-bold font-[family-name:var(--font-geist-mono)]">
                  {formatCurrency(expense.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
