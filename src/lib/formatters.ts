export function formatKwanza(n: number) {
  return n.toLocaleString("pt-AO") + " Kz";
}

/**
 * Retorna uma etiqueta amigável para a data (Hoje, Ontem ou Data Completa).
 * Agora com tratamento de erro para datas inválidas.
 */
export function dateLabel(dateStr: string) {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Data Inválida";

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    
    if (dateStr === today) return "Hoje";
    if (dateStr === yesterday) return "Ontem";
    
    return date.toLocaleDateString("pt-AO", { 
      weekday: "long", 
      day: "numeric", 
      month: "long" 
    });
  } catch (e) {
    return "Data Inválida";
  }
}
