/**
 * @fileoverview HTML string processing utility functions.
 * Provides functions for escaping and unescaping HTML entities, and other HTML-related string manipulations.
 */

/**
 * Map of special HTML characters to their corresponding escape sequences.
 * @type {Object<string, string>}
 */
const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;' // Using &#039; for single quotes is generally safer
};

/**
 * Map of HTML escape sequences to their corresponding special characters (reverse map).
 * @type {Object<string, string>}
 */
const HTML_UNESCAPE_MAP = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#039;': "'"
};

/**
 * Escapes special HTML characters in a string.
 * Converts special characters to their corresponding HTML entities to prevent XSS attacks.
 * @param {string} text - The string to escape.
 * @returns {string} The escaped string.
 */
export const escapeHTML = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/[&<>"']/g, char => HTML_ESCAPE_MAP[char] || char);
};

/**
 * Alias for escapeHTML, specifically for escaping HTML attribute values.
 * @param {string} text - The attribute value to escape.
 * @returns {string} The escaped attribute value.
 */
export const escapeHTMLAttr = (text) => {
    return escapeHTML(text);
};

// 中文别名导出
export const 转义HTML = escapeHTML;
export const 转义HTML属性 = escapeHTMLAttr;

/**
 * Unescapes HTML entities in a string.
 * Converts HTML entities back to their corresponding special characters.
 * @param {string} text - The string containing HTML entities.
 * @returns {string} The unescaped string.
 */
export const unescapeHTML = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, entity => HTML_UNESCAPE_MAP[entity] || entity);
};

// 中文别名导出
export const 反转义HTML = unescapeHTML;

/**
 * Removes leading/trailing whitespace and replaces multiple whitespace characters with a single space.
 * @param {string} text - The text to sanitize.
 * @returns {string} The sanitized text.
 */
export const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text.trim().replace(/\s+/g, ' ');
};

// 中文别名导出
export const 清理文本 = sanitizeText;

/**
 * Removes all HTML tags from a string, leaving only the text content.
 * @param {string} text - The string containing HTML tags.
 * @returns {string} The string with HTML tags removed.
 */
export const stripHTMLTags = (text) => {
  if (!text || typeof text !== 'string') return '';
  // This regex removes tags but leaves content between them.
  return text.replace(/<[^>]*>/g, '');
};

// 中文别名导出
export const 去除HTML标签 = stripHTMLTags;

/**
 * Converts plain text to HTML paragraphs.
 * Splits text by newlines, trims lines, removes empty lines, and wraps non-empty lines in <p> tags.
 * Optionally escapes HTML content within the lines.
 * @param {string} text - The text to convert.
 * @param {boolean} [shouldEscape=true] - Whether to escape HTML special characters in the text content.
 * @returns {string} The resulting HTML string with paragraphs.
 */
export const textToParagraphs = (text, shouldEscape = true) => {
  if (!text || typeof text !== 'string') return '';
  const processedText = shouldEscape ? escapeHTML(text) : text;
  return processedText
    .split(/\r?\n/) // Split by newline characters
    .map(line => line.trim()) // Trim whitespace from each line
    .filter(line => line) // Remove empty lines
    .map(line => `<p>${line}</p>`) // Wrap each line in <p> tags
    .join(''); // Join paragraphs
};

// 中文别名导出
export const 文本转段落 = textToParagraphs;

/**
 * Escapes HTML safely, preserving specified HTML tags.
 * @param {string} text - The text to escape.
 * @param {Array<string>} [allowedTags=[]] - An array of HTML tag names (lowercase) to preserve.
 * @returns {string} The partially escaped text.
 */
export const partialEscapeHTML = (text, allowedTags = []) => {
  if (!text || typeof text !== 'string') return '';
  if (!allowedTags.length) return escapeHTML(text);

  // Build regex to match allowed tags (opening or closing)
  const tagList = allowedTags.join('|');
  // Matches <tag>, </tag>, or <tag ...attributes>
  const tagRegex = new RegExp(`<(/?)(${tagList})(\s[^>]*)?>`, 'gi');

  // Use placeholders to protect allowed tags during escaping
  const placeholderPrefix = `__HTML_TAG_PLACEHOLDER_${Date.now()}_`;
  let replaceCount = 0;
  const tagMap = {};

  const textWithPlaceholders = text.replace(tagRegex, (match) => {
    const placeholder = `${placeholderPrefix}${replaceCount++}__`;
    tagMap[placeholder] = match; // Store the original tag
    return placeholder;
  });

  // Escape the text with placeholders
  const escapedText = escapeHTML(textWithPlaceholders);

  // Restore the allowed tags from placeholders
  return escapedText.replace(new RegExp(`${placeholderPrefix}\d+__`, 'g'), placeholder => {
    return tagMap[placeholder] || placeholder; // Return original tag or placeholder if not found (shouldn't happen)
  });
};

// 中文别名导出
export const 部分转义HTML = partialEscapeHTML;

/**
 * Converts plain text to basic HTML, preserving line breaks and spaces.
 * @param {string} text - The plain text to convert.
 * @returns {string} The converted HTML string.
 */
export const textToHTML = (text) => {
  if (!text || typeof text !== 'string') return '';
  return escapeHTML(text)
    .replace(/\n/g, '<br>')
    .replace(/  /g, '&nbsp; ') // Replace double space with nbsp + space for better rendering
    .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;'); // Replace tab with 4 nbsps
};

// 中文别名导出
export const 文本转HTML = textToHTML; 