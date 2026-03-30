export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export const categoryLabels: Record<string, string> = {
  ALIMENTACAO: "Alimentação",
  TRANSPORTE: "Transporte",
  SAUDE: "Saúde",
  LAZER: "Lazer",
  CASA: "Casa",
  EDUCACAO: "Educação",
  OUTROS: "Outros",
};

export const categoryColors: Record<string, string> = {
  ALIMENTACAO: "#00f5d4",
  TRANSPORTE: "#7b2ff7",
  SAUDE: "#f72585",
  LAZER: "#fee440",
  CASA: "#00bbf9",
  EDUCACAO: "#9b5de5",
  OUTROS: "#6c757d",
};
