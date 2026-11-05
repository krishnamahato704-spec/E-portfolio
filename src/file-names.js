export function evidenceFileName(title, path) {
  const extension = String(path).match(/\.(pdf|pptx|docx|png|jpe?g|webp|avif)(?=$|[?#])/i)?.[0].toLowerCase();
  const name = String(title ?? '').normalize('NFKC').toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100)
    .replace(/-$/, '');
  return name && extension ? name + extension : '';
}
