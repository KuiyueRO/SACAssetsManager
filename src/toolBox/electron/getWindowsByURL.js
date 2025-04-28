const { BrowserWindow } = require('@electron/remote');

const LOG_PREFIX = '[Window Query]'; // Define a prefix for logs

function createURLInternal(url) {
    try {
        return new URL(url);
    } catch(e) {
        // console.error(`${LOG_PREFIX} Failed to parse URL:`, url, e); // Keep logs minimal or use a logger
        return null;
    }
}

/**
 * Checks if two URLs have the same hostname, path (ignoring trailing index.html), and search parameters.
 * @param {string} url1
 * @param {string} url2
 * @returns {boolean}
 */
function isSameOriginAndPath(url1, url2) {
    try {
        const $url1 = createURLInternal(url1);
        const $url2 = createURLInternal(url2);

        if (!$url1 || !$url2) return false;

        // Normalize path by removing trailing /index.html or /
        const path1 = $url1.pathname.replace(/\/?(?:index\.html)?$/, '');
        const path2 = $url2.pathname.replace(/\/?(?:index\.html)?$/, '');

        // Compare hostname, normalized path, and search parameters
        return path1 === path2 &&
               $url1.hostname === $url2.hostname &&
               $url1.search === $url2.search;
    } catch(e) {
        // console.error(`${LOG_PREFIX} Failed to compare URLs:`, e);
        return false;
    }
}

/**
 * Finds all currently open and non-destroyed Electron BrowserWindows whose webContents URL
 * matches the specified URL (comparing hostname, path, and search parameters).
 *
 * @param {string} url The URL to match against window contents.
 * @returns {Array<BrowserWindow>} An array of matching BrowserWindow instances.
 */
export function getAllWindowsByURL(url) {
    if (!BrowserWindow) {
        console.error(`${LOG_PREFIX} BrowserWindow from @electron/remote is not available.`);
        return [];
    }

    try {
        const allWindows = BrowserWindow.getAllWindows();
        return allWindows.filter(win => {
            try {
                if (!win || win.isDestroyed()) return false;

                const webContents = win.webContents;
                if (!webContents || webContents.isDestroyed()) return false;

                const winUrl = webContents.getURL();
                if (!winUrl) return false;

                return isSameOriginAndPath(winUrl, url);
            } catch(e) {
                // Log errors related to accessing specific window properties
                // console.error(`${LOG_PREFIX} Error accessing window or webContents properties:`, e);
                return false;
            }
        });
    } catch (error) {
        // Log errors related to getAllWindows or general filtering issues
        console.error(`${LOG_PREFIX} Error filtering windows:`, error);
        return [];
    }
} 