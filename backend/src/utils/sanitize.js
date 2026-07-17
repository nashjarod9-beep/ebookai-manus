const sanitizeHtml = require('sanitize-html');

/**
 * Désinfecte le code HTML généré par l'IA ou les convertisseurs de markdown
 * pour empêcher les failles XSS tout en préservant le style premium de l'ebook.
 * @param {string} rawHtml - Le HTML brut généré
 */
function sanitizeGeneratedHtml(rawHtml) {
  if (!rawHtml) return '';
  return sanitizeHtml(rawHtml, {
    allowedTags: [
      'h1', 'h2', 'h3', 'p', 'strong', 'em', 'ul', 'ol', 'li', 'img', 'a',
      'div', 'span', 'svg', 'path', 'blockquote', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    allowedAttributes: {
      'a': ['href', 'target', 'rel'],
      'img': ['src', 'alt', 'class', 'style'],
      'div': ['class', 'style'],
      'span': ['class', 'style'],
      'svg': ['viewbox', 'width', 'height', 'stroke', 'stroke-width', 'fill'],
      'path': ['d'],
      'td': ['colspan', 'rowspan', 'style'],
      'th': ['colspan', 'rowspan', 'style']
    },
    allowedSchemes: ['http', 'https', 'mailto', 'data'] // Permet data:image pour les illustrations inline
  });
}

module.exports = {
  sanitizeGeneratedHtml
};
