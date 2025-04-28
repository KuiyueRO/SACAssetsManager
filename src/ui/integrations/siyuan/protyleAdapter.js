/**
 * @fileoverview Adapter for integrating SiYuan Protyle editor functionality into the UI.
 * Implements UI API for rendering SiYuan blocks using Protyle.
 */

import { clientApi, plugin } from "../../../../source/asyncModules.js"; // Adjusted import path

/**
 * Creates and renders a Protyle editor instance within the specified element, displaying the content of the given block ID.
 *
 * This acts as an adapter fulfilling the UI API requirements for rendering SiYuan content.
 *
 * @param {HTMLElement} element - The HTML element that will host the Protyle editor.
 * @param {string} blockId - The ID of the SiYuan block to render.
 * @returns {any} The Protyle instance (specific type depends on `clientApi.Protyle`).
 */
export const createProtyleById = (element, blockId) => {
    // Ensure plugin and clientApi are available (basic check)
    if (!plugin || !clientApi || !clientApi.Protyle) {
        console.error("SiYuan plugin context or Protyle API not available.");
        // Maybe throw an error or return null/undefined based on how the UI API expects errors.
        // For now, let it potentially fail in the constructor if called.
    }
    // Ensure element is a valid HTMLElement
    if (!(element instanceof HTMLElement)) {
        console.error("Invalid element provided for Protyle container.");
        return null; // Or throw?
    }

    try {
        return new clientApi.Protyle(
            plugin.app, // Assumes plugin.app is the correct context
            element,
            {
                blockId: blockId,
                // Consider making render options configurable via parameters or a config object
                render: {
                    breadcrumb: true,
                    background: true,
                    title: true
                }
            }
        );
    } catch (error) {
        console.error(`Failed to create Protyle instance for block ${blockId}:`, error);
        // Handle or re-throw error based on UI API contract
        throw error; // Re-throwing for now
    }
}; 