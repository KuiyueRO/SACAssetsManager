/**
 * @fileoverview Utility functions for creating DOM elements and fragments.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';
const XLINK_NS = 'http://www.w3.org/1999/xlink';

// Namespace map for SVG elements
const NS_MAP = {
    'svg': SVG_NS,
    'xlink': XLINK_NS,
};

/**
 * Creates a base DOM element, handling SVG namespaces.
 * @param {string} tag - The tag name, potentially with a namespace prefix (e.g., 'svg:rect').
 * @returns {Element} The created DOM element.
 * @private
 */
function _createBaseElement(tag) {
    if (tag.includes(':')) {
        const [ns, localName] = tag.split(':');
        const namespace = NS_MAP[ns];
        if (namespace) {
            return document.createElementNS(namespace, localName);
        }
    } else if (tag === 'svg') {
        return document.createElementNS(SVG_NS, 'svg');
    }
    return document.createElement(tag);
}

/**
 * Sets attributes and properties on a DOM element.
 * Handles class, style, event listeners, and SVG attributes.
 * @param {Element} element - The DOM element to modify.
 * @param {object | null} [attrs] - An object containing attributes and properties.
 * @returns {Element} The modified element.
 * @private
 */
function _setAttributes(element, attrs = {}) {
    if (!attrs) return element;

    const isSvg = element instanceof SVGElement;

    for (const [key, value] of Object.entries(attrs)) {
        if (value === null || value === undefined) continue;

        // Handle special attributes
        if (key === 'class' || key === 'className') {
            const className = Array.isArray(value) ? value.filter(Boolean).join(' ') : value;
            // Use setAttribute for SVG, className for HTML for better compatibility/performance
            isSvg ? element.setAttribute('class', className) : element.className = className;
            continue;
        }

        if (key === 'style' && typeof value === 'object') {
            Object.assign(element.style, value);
            continue;
        }

        // Handle event listeners (e.g., onClick, oninput)
        if (key.startsWith('on') && typeof value === 'function') {
            const eventName = key.slice(2).toLowerCase();
            element.addEventListener(eventName, value);
            continue;
        }

        // Handle SVG specific attributes (like xlink:href)
        if (isSvg) {
            if (key.startsWith('xlink:')) {
                element.setAttributeNS(XLINK_NS, key, value);
            } else {
                // Convert camelCase to kebab-case for SVG attributes (e.g., viewBox)
                const kebabKey = key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
                element.setAttribute(kebabKey, value);
            }
            continue;
        }

        // Handle standard HTML attributes/properties
        // Prefer setting properties directly if they exist, otherwise use setAttribute
        if (key in element && typeof element[key] !== 'object' && typeof element[key] !== 'function') {
             try {
                 element[key] = value;
             } catch (e) {
                 // Fallback for read-only properties or other issues
                 element.setAttribute(key, value);
             }
        } else {
            element.setAttribute(key, value);
        }
    }

    return element;
}

/**
 * Appends children to a DOM element or fragment.
 * Handles strings, numbers, Nodes, and arrays of children.
 * @param {Element | DocumentFragment} element - The parent element or fragment.
 * @param {?(string | number | Node | Array)} children - The children to append.
 * @returns {Element | DocumentFragment} The parent element or fragment.
 * @private
 */
function _appendChildren(element, children) {
    if (!children) return element;

    const append = child => {
        if (child === null || child === undefined) return;

        if (typeof child === 'string' || typeof child === 'number') {
            element.appendChild(document.createTextNode(String(child)));
        } else if (child instanceof Node) {
            element.appendChild(child);
        } else if (Array.isArray(child)) {
            // Recursively append children in nested arrays
            child.forEach(append);
        } // Ignore other types
    };

    if (Array.isArray(children)) {
        children.forEach(append);
    } else {
        append(children);
    }
    return element;
}

/**
 * Creates a DOM element with specified attributes and children.
 * Similar to Hyperscript (h function).
 *
 * @param {string} tag - The HTML or SVG tag name (e.g., 'div', 'svg:rect').
 * @param {object | null} [attrs] - An object of attributes/properties (e.g., { class: 'my-class', onClick: handler }). Can be null.
 * @param {...(string | number | Node | Array)} children - Child elements or text content.
 * @returns {Element} The created DOM element.
 */
export function createElement(tag, attrs, ...children) {
    // Handle optional attrs argument: createElement('div', child1, child2)
    if (attrs && (typeof attrs !== 'object' || attrs instanceof Node || Array.isArray(attrs))) {
        children.unshift(attrs); // Prepend attrs to children array
        attrs = null;
    }

    const element = _createBaseElement(tag);
    _setAttributes(element, attrs);
    _appendChildren(element, children.flat()); // Flatten children array for easier nesting
    return element;
}

/**
 * Creates a DocumentFragment and appends children to it.
 *
 * @param {...(string | number | Node | Array)} children - Child elements or text content.
 * @returns {DocumentFragment} The created DocumentFragment.
 */
export function createFragment(...children) {
    const fragment = document.createDocumentFragment();
    _appendChildren(fragment, children.flat()); // Flatten children array
    return fragment;
} 