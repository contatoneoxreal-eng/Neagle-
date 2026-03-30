export interface ReceiptData {
  storeName: string;
  date: string;
  category: string;
  total: number;
  items: ReceiptItem[];
}

export interface ReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ExpenseWithItems {
  id: string;
  storeName: string;
  total: number;
  date: string;
  category: string;
  rawText: string | null;
  imageUrl: string | null;
  createdAt: string;
  items: {
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
}

export interface DashboardStats {
  totalMonth: number;
  totalWeek: number;
  dailyAverage: number;
  biggestExpense: number;
  totalReceipts: number;
  categoryBreakdown: { category: string; total: number }[];
  dailyExpenses: { date: string; total: number }[];
}
