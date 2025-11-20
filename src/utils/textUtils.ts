// =============================================================================
// STUDYBOT FRONTEND - UTILITAIRES DE TRAITEMENT DE TEXTE
// =============================================================================

/**
 * Fonction pour parser le Markdown basique
 * @param text - Le texte contenant du Markdown
 * @returns Le texte avec le Markdown converti en HTML
 */
export function parseMarkdown(text: string): string {
  let parsed = text;
  
  // 0. ⚡ CRITIQUE: Nettoyer d'abord tout HTML malformé qui pourrait exister
  // Supprimer les fragments HTML orphelins comme 'presse.aspx" target="_blank"...'
  parsed = parsed.replace(/[a-zA-Z0-9\-_.]+\.(?:aspx|html|php|htm)["'][^>]*>([^<\n]+)/g, '$1');
  
  // Supprimer les balises HTML orphelines
  parsed = parsed.replace(/<\/?a[^>]*>/gi, '');
  
  // Supprimer les attributs HTML orphelins
  parsed = parsed.replace(/(?:target|rel|class)=["'][^"']*["']/gi, '');
  
  // 1. Liens Markdown: [texte](url)
  // ⚠️ Protection: ne pas parser si déjà transformé en HTML
  if (!parsed.includes('<a href=')) {
    parsed = parsed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="bot-link">$1</a>');
  }
  
  // 2. Gras: **texte**
  parsed = parsed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // 3. Italique: *texte* (mais pas les ** déjà traités)
  parsed = parsed.replace(/(?<!\*)\*(?!\*)([^*]+)\*(?!\*)/g, '<em>$1</em>');
  
  return parsed;
}

/**
 * Fonction pour raccourcir une URL longue en texte lisible
 * @param url - L'URL complète
 * @returns Un texte court représentant l'URL
 */
function shortenUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace('www.', '');
    
    // Extraire le nom du document depuis l'URL si possible
    const pathParts = urlObj.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    
    // Si le dernier segment contient un nom lisible (pas juste des chiffres)
    if (lastPart && lastPart.length > 3 && /[a-zA-Z]/.test(lastPart)) {
      // Décoder et nettoyer (enlever extensions, tirets, etc.)
      const cleaned = decodeURIComponent(lastPart)
        .replace(/\.(aspx|html|php|pdf)$/i, '')
        .replace(/[-_]/g, ' ')
        .slice(0, 40);
      return cleaned || domain;
    }
    
    // Sinon, retourner juste le domaine
    return domain;
  } catch {
    // Si l'URL est invalide, tronquer simplement
    return url.length > 40 ? url.slice(0, 37) + '...' : url;
  }
}

/**
 * Fonction pour transformer les URLs brutes en liens cliquables avec texte raccourci
 * @param text - Le texte contenant potentiellement des URLs
 * @returns Le texte avec les URLs transformées en liens HTML
 */
export function linkifyText(text: string): string {
  // Regex pour détecter les URLs brutes (pas déjà dans des balises <a>)
  const urlRegex = /(?<!href="|">)(https?:\/\/[^\s<]+)/gi;
  
  return text.replace(urlRegex, (url) => {
    // Nettoyer l'URL des caractères de fin indésirables
    const cleanUrl = url.replace(/[.,;:!?)]+$/, '');
    
    // Raccourcir l'URL pour l'affichage
    const displayText = shortenUrl(cleanUrl);
    
    // Créer le lien cliquable avec texte raccourci
    return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="bot-link">${displayText}</a>`;
  });
}

/**
 * Fonction pour traiter les retours à la ligne et transformer le texte en HTML
 * @param text - Le texte brut avec Markdown
 * @returns Le texte formaté avec Markdown parsé, liens cliquables et retours à la ligne
 */
export function formatBotMessage(text: string): string {
  // 1. Parser le Markdown (gras, italique, liens Markdown)
  let formatted = parseMarkdown(text);
  
  // 2. Transformer les URLs brutes restantes en liens
  formatted = linkifyText(formatted);
  
  // 3. Gérer les listes numérotées (1. item)
  formatted = formatted.replace(/^(\d+)\.\s+(.+)$/gm, '<li style="margin-left: 20px;">$2</li>');
  
  // 4. Gérer les listes à puces (- item ou • item)
  formatted = formatted.replace(/^[-•]\s+(.+)$/gm, '<li style="margin-left: 20px; list-style-type: disc;">$1</li>');
  
  // 5. Gérer les retours à la ligne (SANS injecter de balises qui casseraient les URLs)
  // Simplement remplacer les sauts de ligne par <br>
  formatted = formatted.replace(/\n/g, '<br>');
  
  // 6. Encapsuler dans une div avec styles (sans <p> pour éviter les conflits)
  return `<div style="word-wrap: break-word; word-break: break-word; overflow-wrap: break-word; max-width: 100%; line-height: 1.5;">${formatted}</div>`;
}

/**
 * Fonction pour détecter si un message contient des liens
 * @param text - Le texte à analyser
 * @returns true si le texte contient des URLs
 */
export function containsLinks(text: string): boolean {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/gi;
  return urlRegex.test(text);
} 