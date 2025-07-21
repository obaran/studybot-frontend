// =============================================================================
// STUDYBOT FRONTEND - UTILITAIRES DE TRAITEMENT DE TEXTE
// =============================================================================

/**
 * Fonction pour transformer les URLs en liens cliquables
 * @param text - Le texte contenant potentiellement des URLs
 * @returns Le texte avec les URLs transformées en liens HTML
 */
export function linkifyText(text: string): string {
  // Regex pour détecter les URLs (http, https, www, et domaines simples)
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/gi;
  
  return text.replace(urlRegex, (url) => {
    // Déterminer l'URL complète
    let fullUrl = url;
    if (!url.startsWith('http')) {
      fullUrl = url.startsWith('www.') ? `https://${url}` : `https://${url}`;
    }
    
    // Créer le lien SIMPLIFIÉ sans JavaScript inline (cause des problèmes)
    return `<a href="${fullUrl}" target="_blank" rel="noopener noreferrer" class="bot-link">${url}</a>`;
  });
}

/**
 * Fonction pour traiter les retours à la ligne et transformer le texte en HTML
 * @param text - Le texte brut
 * @returns Le texte formaté avec liens cliquables et retours à la ligne
 */
export function formatBotMessage(text: string): string {
  // 1. Transformer les URLs en liens AVANT l'échappement HTML
  const linkedText = linkifyText(text);
  
  // 2. Gérer les retours à la ligne
  const formattedText = linkedText
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
  
  // 3. Encapsuler dans des paragraphes avec styles de protection contre le débordement
  return `<div style="word-wrap: break-word; word-break: break-word; overflow-wrap: break-word; max-width: 100%;"><p>${formattedText}</p></div>`;
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