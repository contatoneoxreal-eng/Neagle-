import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const emptyResponse = {
  expenses: [],
  stats: {
    totalMonth: 0,
    totalWeek: 0,
    dailyAverage: 0,
    biggestExpense: 0,
    totalReceipts: 0,
    categoryBreakdown: [],
    dailyExpenses: [],
  },
};

export async function GET(request: NextRequest) {
  try {
    const period = request.nextUrl.searchParams.get("period") || "month";
    const category = request.nextUrl.searchParams.get("category");

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case "month":
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const where: Record<string, unknown> = {
      date: { gte: startDate },
    };
    if (category) {
      where.category = category;
    }

    const [expenses, stats] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: { items: true },
        orderBy: { date: "desc" },
      }),

      prisma.expense.aggregate({
        where: { date: { gte: startDate } },
        _sum: { total: true },
        _max: { total: true },
        _count: true,
      }),
    ]);

    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekTotal = await prisma.expense.aggregate({
      where: { date: { gte: weekStart } },
      _sum: { total: true },
    });

    const categoryBreakdown = await prisma.expense.groupBy({
      by: ["category"],
      where: { date: { gte: startDate } },
      _sum: { total: true },
    });

    const daysInPeriod = Math.max(
      1,
      Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    );

    const dailyExpensesRaw = await prisma.expense.groupBy({
      by: ["date"],
      where: { date: { gte: startDate } },
      _sum: { total: true },
      orderBy: { date: "asc" },
    });

    const dailyExpenses = dailyExpensesRaw.map((d) => ({
      date: d.date.toISOString().split("T")[0],
      total: d._sum.total || 0,
    }));

    return NextResponse.json({
      expenses,
      stats: {
        totalMonth: stats._sum.total || 0,
        totalWeek: weekTotal._sum.total || 0,
        dailyAverage: (stats._sum.total || 0) / daysInPeriod,
        biggestExpense: stats._max.total || 0,
        totalReceipts: stats._count,
        categoryBreakdown: categoryBreakdown.map((c) => ({
          category: c.category,
          total: c._sum.total || 0,
        })),
        dailyExpenses,
      },
    });
  } catch (error) {
    console.error("Expenses API error:", error);
    return NextResponse.json(emptyResponse);
  }
}
