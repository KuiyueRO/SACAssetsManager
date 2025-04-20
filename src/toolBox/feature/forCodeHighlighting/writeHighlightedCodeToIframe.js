/**
 * @fileoverview Provides a function to write code content into an iframe and highlight it using highlight.js.
 */

import { escapeHTML } from '../../base/useEcma/forString/forHtmlProcessing.js';

// Default paths for highlight.js assets (relative to the application root)
// Consider making these configurable or dynamically determined.
const DEFAULT_HLJS_CSS_PATH = '/stage/protyle/js/highlight.js/styles/default.min.css';
const DEFAULT_HLJS_JS_PATH = '/stage/protyle/js/highlight.js/highlight.min.js';

/**
 * Writes code content into an iframe, initializing highlight.js if necessary,
 * and applies syntax highlighting. Also includes logic to auto-resize the iframe height.
 * Assumes the iframe and highlight.js library are accessible in the environment.
 *
 * @param {HTMLIFrameElement} contentFrame - The target iframe element.
 * @param {string} codeData - The code string to write and highlight.
 * @param {object} [options={}] - Optional configuration.
 * @param {string} [options.hljsCssPath=DEFAULT_HLJS_CSS_PATH] - Path to highlight.js CSS file.
 * @param {string} [options.hljsJsPath=DEFAULT_HLJS_JS_PATH] - Path to highlight.js JS file.
 * @param {boolean} [options.append=false] - If true, attempts to append data to existing code block instead of overwriting.
 * @returns {Promise<void>} A promise that resolves when the operation is complete or rejects on error.
 */
export async function writeHighlightedCodeToIframe(contentFrame, codeData, options = {}) {
    const { hljsCssPath = DEFAULT_HLJS_CSS_PATH, hljsJsPath = DEFAULT_HLJS_JS_PATH, append = false } = options;

    if (!contentFrame || !contentFrame.contentWindow || !contentFrame.contentDocument) {
        console.error('writeHighlightedCodeToIframe: Invalid iframe element provided.');
        return Promise.reject(new Error('Invalid iframe element'));
    }

    try {
        const doc = contentFrame.contentDocument;
        const win = contentFrame.contentWindow;
        const escapedCode = escapeHTML(codeData);

        // Check if highlight.js is already loaded in the iframe
        const isHljsLoaded = typeof win.hljs !== 'undefined';

        if (append && isHljsLoaded) {
            // Attempt to append to existing code block
            const existingCodeBlock = doc.querySelector('pre code');
            if (existingCodeBlock) {
                // Append new content
                existingCodeBlock.appendChild(document.createTextNode(codeData)); // Append raw text node
                // Re-highlight the entire block
                win.hljs.highlightElement(existingCodeBlock);
                // Trigger resize manually if needed after append
                // win.postMessage('resizeIframe', '*'); // Or call resize function directly if possible
            } else {
                console.warn('writeHighlightedCodeToIframe: Append mode enabled, but no existing code block found. Overwriting.');
                // Fallback to overwrite if append target not found
                await _initialWrite(doc, win, escapedCode, hljsCssPath, hljsJsPath);
            }
        } else {
            // Overwrite or initial write
            await _initialWrite(doc, win, escapedCode, hljsCssPath, hljsJsPath);
        }
    } catch (err) {
        console.error('Error writing to iframe or highlighting code:', err);
        return Promise.reject(err);
    }
}

/**
 * Performs the initial write operation to the iframe, including HTML structure and scripts.
 * @private
 */
async function _initialWrite(doc, win, escapedCode, hljsCssPath, hljsJsPath) {
    const iframeContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <link rel="stylesheet" href="${escapeHTMLAttr(hljsCssPath)}">
            <style>
                /* Basic iframe styling */
                body { margin: 0; overflow: hidden; background-color: var(--b3-theme-surface, white); color: var(--b3-theme-on-surface, black); }
                pre { margin: 0; white-space: pre-wrap !important; word-wrap: break-word; }
                code.hljs { padding: 0.5em; }
            </style>
        </head>
        <body>
            <pre><code class="hljs">${escapedCode}</code></pre>
            <script src="${escapeHTMLAttr(hljsJsPath)}"></script>
            <script>
                function initHighlightingAndResize() {
                    // Highlight the code block
                    try {
                        if (typeof hljs !== 'undefined') {
                             const codeBlock = document.querySelector('pre code');
                             if (codeBlock) {
                                 hljs.highlightElement(codeBlock);
                             } else {
                                 console.warn('Code block not found for highlighting.');
                             }
                        } else {
                             console.warn('highlight.js (hljs) not loaded.');
                        }
                    } catch (e) {
                         console.error('Error during highlighting:', e);
                    }

                    // Setup ResizeObserver to adjust parent iframe height
                    try {
                        const observer = new ResizeObserver(entries => {
                            requestAnimationFrame(() => { // Debounce using requestAnimationFrame
                                if (!entries || !entries.length) return;
                                const height = entries[0].target.scrollHeight; // Use scrollHeight for better accuracy
                                // Communicate height back to parent window
                                if (window.parent && window.parent !== window) {
                                     window.parent.postMessage({ type: 'iframeResize', height: height }, '*');
                                     // Alternative: Directly set style if same origin
                                     // try { window.parent.document.getElementById('YOUR_IFRAME_ID').style.height = height + 'px'; } catch(e) {}
                                }
                            });
                        });
                        observer.observe(document.documentElement); // Observe the root element
                    } catch (e) {
                        console.error('ResizeObserver setup failed:', e);
                    }
                }

                // Run initialization after scripts are loaded and DOM is ready
                if (document.readyState === 'complete') {
                    initHighlightingAndResize();
                } else {
                    window.addEventListener('load', initHighlightingAndResize);
                }
            </script>
        </body>
        </html>
    `;
    doc.open();
    doc.write(iframeContent);
    doc.close();
    // Give the browser a moment to process the write and load scripts
    await new Promise(resolve => setTimeout(resolve, 0));
} 