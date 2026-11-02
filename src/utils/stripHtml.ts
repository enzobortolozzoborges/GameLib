/**
 * Remove tags HTML e decodifica entidades para exibição limpa em texto puro.
 * Converte tags de quebra de linha em \n e remove todas as demais tags.
 */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return '';

  return (
    html
      // Converte quebras de linha HTML em novas linhas
      .replace(/<br\s*[\/]?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/li>/gi, '\n')
      // Remove todas as demais tags HTML
      .replace(/<[^>]+>/g, '')
      // Decodifica entidades HTML comuns
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
      // Normaliza quebras de linha excessivas
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
}
