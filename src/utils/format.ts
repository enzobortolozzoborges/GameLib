export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'Data não informada';

  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      const monthNames = [
        'jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.',
        'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.',
      ];
      const monthIndex = parseInt(month, 10) - 1;
      const monthName = monthNames[monthIndex] || month;
      return `${parseInt(day, 10)} de ${monthName} de ${year}`;
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('pt-BR');
  } catch {
    return dateString;
  }
}

export function getMetacriticColor(score: number | null | undefined): string {
  if (score === null || score === undefined) return '#8f98a0';
  if (score >= 75) return '#66cc33';
  if (score >= 50) return '#ffcc33';
  return '#ff3333';
}
