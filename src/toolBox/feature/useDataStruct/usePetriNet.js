import { computeCurrying } from '../../../base/useEcma/forFunctions/forCurrying.js'; // Updated import path

/**
 * @typedef {Object} PlaceConfig Configuration for a Petri Net place (node).
 * @property {'start'|'process'|'end'} type - The type of the place.
 * @property {number} tokens - The initial number of tokens in the place.
 * @property {*} [content] - Optional content associated with the place.
 */

/**
 * @typedef {Object} ArcInfo Information about a connection (arc) between nodes/transitions.
 * @property {string} sourceId - The ID of the source place/transition.
 * @property {string} targetId - The ID of the target place/transition.
 * @property {number} weight - The number of tokens required/produced by the arc.
 */

/**
 * @typedef {Object} PetriNet The Petri Net data structure.
 * @property {string} name - The name of the Petri Net.
 * @property {Map<string, Object>} places - Collection of places (nodes).
 * @property {Map<string, Object>} transitions - Collection of transitions (actions).
 * @property {Map<string, ArcInfo>} arcs - Collection of arcs (connections).
 * @property {Map<string, ArcInfo[]>} inputArcsIndex - Index of arcs by target ID.
 * @property {Map<string, ArcInfo[]>} outputArcsIndex - Index of arcs by source ID.
 * @property {Set<string>} entryPlaceIndex - Set of entry places (no incoming arcs).
 * @property {Set<string>} exitPlaceIndex - Set of exit places (no outgoing arcs).
 * @property {function(): Promise<void>} exec - Method to execute the Petri Net simulation.
 */

/**
 * Creates a new, empty Petri Net structure.
 * @param {string} name - The name for the Petri Net.
 * @returns {PetriNet} The initialized Petri Net object.
 * @throws {Error} If the name is not a non-empty string.
 */
export const createPetriNet = (name) => {
    if (typeof name !== 'string' || !name.trim()) {
        throw new Error('Petri Net name must be a non-empty string.');
    }
    const petriNet = {
        name,
        places: new Map(),
        transitions: new Map(),
        arcs: new Map(),
        inputArcsIndex: new Map(),
        outputArcsIndex: new Map(),
        entryPlaceIndex: new Set(),
        exitPlaceIndex: new Set(),
        exec: undefined, // Will be assigned below
    };
    // Add exec method using the execute function
    petriNet.exec = async function () {
        await executePetriNet(this);
    };

    return petriNet;
};

/**
 * Curried function to add a place (node) to the Petri Net.
 * @param {PetriNet} petriNet - The Petri Net instance.
 * @param {string} placeId - The unique ID for the place.
 * @param {PlaceConfig} config - The configuration for the place.
 * @throws {Error} If placeId exists, config is invalid, type is invalid, or tokens are invalid.
 */
export const addPlaceCurried = computeCurrying((petriNet, placeId, config) => {
    if (petriNet.places.has(placeId)) {
        console.warn(`Place ${placeId} already exists. Addition skipped. Ensure this is intended.`);
        return; // Skip if already exists
    }

    if (!config || typeof config !== 'object') {
        throw new Error(`Configuration for place ${placeId} must be an object.`);
    }
    if (!['start', 'process', 'end'].includes(config.type)) {
        throw new Error(`Invalid type '${config.type}' for place ${placeId}. Must be 'start', 'process', or 'end'.`);
    }
    if (typeof config.tokens !== 'number' || config.tokens < 0 || !Number.isInteger(config.tokens)) {
        throw new Error(`Token count for place ${placeId} must be a non-negative integer.`);
    }

    petriNet.places.set(placeId, {
        type: config.type,
        tokens: config.tokens,
        content: config.content,
    });

    // Initially, every new place is considered both an entry and exit point
    petriNet.entryPlaceIndex.add(placeId);
    petriNet.exitPlaceIndex.add(placeId);
});

/**
 * Curried function to add a transition (action) to the Petri Net.
 * @param {PetriNet} petriNet - The Petri Net instance.
 * @param {string} transitionId - The unique ID for the transition.
 * @param {Function} actionFn - The asynchronous function to execute when the transition fires.
 * @throws {Error} If transitionId exists or actionFn is not a function.
 */
export const addTransitionCurried = computeCurrying((petriNet, transitionId, actionFn) => {
    if (petriNet.transitions.has(transitionId)) {
        console.warn(`Transition ${transitionId} already exists. Addition skipped. Ensure this is intended.`);
        return; // Skip if already exists
    }
    if (typeof actionFn !== 'function') {
        throw new Error(`Action function for transition ${transitionId} must be a function.`);
    }

    petriNet.transitions.set(transitionId, {
        execute: actionFn
    });
});

/**
 * Curried function to check if an arc already exists.
 * @param {PetriNet} petriNet - The Petri Net instance.
 * @param {string} sourceId - The source ID.
 * @param {string} targetId - The target ID.
 * @returns {boolean} True if the arc exists, false otherwise.
 */
export const hasArcCurried = computeCurrying((petriNet, sourceId, targetId) => {
    const arcId = `${sourceId}->${targetId}`;
    return petriNet.arcs.has(arcId);
});

/**
 * Validates if a node (place or transition) exists.
 * @private
 * @param {PetriNet} petriNet - The Petri Net instance.
 * @param {string} nodeId - The ID to validate.
 * @param {string} [nodeTypeDesc='Node'] - Description for error messages (e.g., 'Source node').
 * @returns {{exists: boolean, error: string|null}}
 */
const validateNodeExists = (petriNet, nodeId, nodeTypeDesc = 'Node') => {
    const exists = petriNet.places.has(nodeId) || petriNet.transitions.has(nodeId);
    return {
        exists,
        error: exists ? null : `${nodeTypeDesc} ${nodeId} does not exist.`
    };
};

/**
 * Updates the input/output arc indexes and entry/exit place sets when an arc is added.
 * @private
 * @param {PetriNet} petriNet - The Petri Net instance.
 * @param {ArcInfo} arcInfo - The information about the added arc.
 */
const updateArcIndexes = (petriNet, arcInfo) => {
    const { sourceId, targetId } = arcInfo;

    // Update input index for the target
    if (!petriNet.inputArcsIndex.has(targetId)) {
        petriNet.inputArcsIndex.set(targetId, []);
    }
    petriNet.inputArcsIndex.get(targetId).push(arcInfo);

    // Update output index for the source
    if (!petriNet.outputArcsIndex.has(sourceId)) {
        petriNet.outputArcsIndex.set(sourceId, []);
    }
    petriNet.outputArcsIndex.get(sourceId).push(arcInfo);

    // Update entry/exit sets: adding an arc removes source from exits and target from entries
    petriNet.exitPlaceIndex.delete(sourceId);
    petriNet.entryPlaceIndex.delete(targetId);
};

/**
 * Validates if adding an arc between two IDs is legal according to Petri Net rules.
 * @private
 * @param {PetriNet} petriNet - The Petri Net instance.
 * @param {string} sourceId - The source node/transition ID.
 * @param {string} targetId - The target node/transition ID.
 * @param {boolean} allowDuplicates - Whether duplicate arcs are permitted.
 * @returns {{isValid: boolean, error: string|null, isDuplicate: boolean}}
 */
const validateArcLegality = (petriNet, sourceId, targetId, allowDuplicates) => {
    // 1. Validate existence
    const sourceValidation = validateNodeExists(petriNet, sourceId, 'Source');
    if (!sourceValidation.exists) return { isValid: false, error: sourceValidation.error, isDuplicate: false };
    const targetValidation = validateNodeExists(petriNet, targetId, 'Target');
    if (!targetValidation.exists) return { isValid: false, error: targetValidation.error, isDuplicate: false };

    // 2. Check for existing arc
    const arcId = `${sourceId}->${targetId}`;
    const isDuplicate = petriNet.arcs.has(arcId);
    if (isDuplicate && !allowDuplicates) {
        return { isValid: false, error: `Arc ${arcId} already exists and duplicates are not allowed.`, isDuplicate };
    }
    if (isDuplicate && allowDuplicates) {
         return { isValid: true, error: null, isDuplicate }; // Allow duplicate if requested
    }

    // 3. Validate connection types (Place -> Transition or Transition -> Place)
    const isSourcePlace = petriNet.places.has(sourceId);
    const isSourceTransition = petriNet.transitions.has(sourceId);
    const isTargetPlace = petriNet.places.has(targetId);
    const isTargetTransition = petriNet.transitions.has(targetId);

    if ((isSourcePlace && isTargetPlace) || (isSourceTransition && isTargetTransition)) {
         return { isValid: false, error: `Invalid connection: Cannot connect ${isSourcePlace ? 'Place' : 'Transition'} to ${isTargetPlace ? 'Place' : 'Transition'}.`, isDuplicate: false };
    }

    // 4. Validate start/end node restrictions (using place type)
    const sourcePlace = petriNet.places.get(sourceId);
    const targetPlace = petriNet.places.get(targetId);
    if (sourcePlace?.type === 'end') {
        return { isValid: false, error: 'Cannot create arc originating from an \'end\' place.', isDuplicate: false };
    }
    if (targetPlace?.type === 'start') {
        return { isValid: false, error: 'Cannot create arc terminating at a \'start\' place.', isDuplicate: false };
    }

    return { isValid: true, error: null, isDuplicate: false };
};

/**
 * Curried function to add an arc (connection) to the Petri Net.
 * @param {PetriNet} petriNet - The Petri Net instance.
 * @param {string} sourceId - The ID of the source place/transition.
 * @param {string} targetId - The ID of the target place/transition.
 * @param {number} [weight=1] - The weight of the arc (tokens required/produced).
 * @param {boolean} [allowDuplicates=false] - Whether to allow adding an identical arc if one already exists.
 * @returns {boolean} True if the arc was successfully added, false if it was a permitted duplicate.
 * @throws {Error} If the connection is invalid (and not a permitted duplicate).
 */
export const addArcCurried = computeCurrying((petriNet, sourceId, targetId, weight = 1, allowDuplicates = false) => {
    if (typeof weight !== 'number' || weight <= 0 || !Number.isInteger(weight)) {
        throw new Error(`Arc weight must be a positive integer.`);
    }

    const { isValid, error, isDuplicate } = validateArcLegality(petriNet, sourceId, targetId, allowDuplicates);

    if (isDuplicate && allowDuplicates) {
        console.warn(`Duplicate arc ${sourceId}->${targetId} added.`);
        // Still add it if duplicates are allowed, might be needed for some models
    } else if (!isValid) {
        throw new Error(error);
    }
    // If it's a duplicate but duplicates are *not* allowed, validateArcLegality would have thrown

    const arcInfo = {
        sourceId,
        targetId,
        weight
    };
    const arcId = `${sourceId}->${targetId}`;

    petriNet.arcs.set(arcId, arcInfo);
    updateArcIndexes(petriNet, arcInfo);

    return !isDuplicate; // Return true if a new arc was added, false if it was a duplicate
});

/**
 * Finds all entry places (places with no incoming arcs).
 * @param {PetriNet} petriNet - The Petri Net instance.
 * @returns {string[]} An array of entry place IDs.
 */
export const findEntryPlaces = (petriNet) => {
    return Array.from(petriNet.entryPlaceIndex);
};

/**
 * Finds all exit places (places with no outgoing arcs).
 * @param {PetriNet} petriNet - The Petri Net instance.
 * @returns {string[]} An array of exit place IDs.
 */
export const findExitPlaces = (petriNet) => {
    return Array.from(petriNet.exitPlaceIndex);
};

/**
 * Executes the Petri Net simulation.
 * @param {PetriNet} petriNet - The Petri Net instance.
 * @returns {Promise<void>} A promise that resolves when the execution completes (no more transitions can fire).
 */
async function executePetriNet(petriNet) {
    let executableTransitions = findExecutableTransitions(petriNet);

    while (executableTransitions.length > 0) {
        // Execute all currently enabled transitions (could be parallel or sequential depending on model needs)
        // For simplicity, execute one by one here. Parallel execution needs careful state management.
        const transitionIdToExecute = executableTransitions[0]; // Simple strategy: execute the first one found

        console.log(`Executing transition: ${transitionIdToExecute}`);
        await fireTransition(petriNet, transitionIdToExecute);

        // Find newly enabled transitions after firing
        executableTransitions = findExecutableTransitions(petriNet);
        console.log(`Executable transitions after firing: ${executableTransitions.join(', ') || 'None'}`);

        // Basic deadlock detection (if needed): If no transitions fired but net is not in final state
    }

    console.log("Petri Net execution finished.");
    // Check final state, e.g., tokens in exit places
}

/**
 * Checks if a specific transition is enabled (can fire).
 * @private
 * @param {PetriNet} petriNet - The Petri Net instance.
 * @param {string} transitionId - The ID of the transition to check.
 * @returns {boolean} True if the transition is enabled, false otherwise.
 */
function isTransitionEnabled(petriNet, transitionId) {
    const inputArcs = petriNet.inputArcsIndex.get(transitionId) || [];
    if (!petriNet.transitions.has(transitionId)) return false; // Transition must exist

    // Check if all input places have enough tokens
    for (const arc of inputArcs) {
        const place = petriNet.places.get(arc.sourceId);
        if (!place || place.tokens < arc.weight) {
            return false; // Not enough tokens in an input place
        }
    }
    return true; // All conditions met
}

/**
 * Finds all transitions that are currently enabled.
 * @private
 * @param {PetriNet} petriNet - The Petri Net instance.
 * @returns {string[]} An array of enabled transition IDs.
 */
function findExecutableTransitions(petriNet) {
    const enabled = [];
    for (const transitionId of petriNet.transitions.keys()) {
        if (isTransitionEnabled(petriNet, transitionId)) {
            enabled.push(transitionId);
        }
    }
    return enabled;
}


/**
 * Fires an enabled transition: consumes input tokens, executes action, produces output tokens.
 * @private
 * @param {PetriNet} petriNet - The Petri Net instance.
 * @param {string} transitionId - The ID of the transition to fire.
 * @returns {Promise<void>}
 * @throws {Error} If the transition is not enabled.
 */
async function fireTransition(petriNet, transitionId) {
    if (!isTransitionEnabled(petriNet, transitionId)) {
        throw new Error(`Transition ${transitionId} is not enabled.`);
    }

    const transition = petriNet.transitions.get(transitionId);
    const inputArcs = petriNet.inputArcsIndex.get(transitionId) || [];
    const outputArcs = petriNet.outputArcsIndex.get(transitionId) || [];

    // 1. Consume tokens from input places
    for (const arc of inputArcs) {
        const place = petriNet.places.get(arc.sourceId);
        if (place) { // Should always exist if enabled
            place.tokens -= arc.weight;
        }
    }
    console.log(`Tokens consumed for ${transitionId}. Current state:`, dumpNetState(petriNet));


    // 2. Execute the transition's action function
    try {
        if (transition.execute) {
             await transition.execute(); // Assuming the action is async
        }
    } catch (error) {
        console.error(`Error executing action for transition ${transitionId}:`, error);
        // Decide on error handling: stop execution? rollback token consumption?
        // For now, log error and continue token production.
        // Rollback might require saving state before execution.
    }

    // 3. Produce tokens to output places
    for (const arc of outputArcs) {
        const place = petriNet.places.get(arc.targetId);
        if (place) { // Should always exist
            place.tokens += arc.weight;
        }
    }
     console.log(`Tokens produced for ${transitionId}. Current state:`, dumpNetState(petriNet));
}

// Helper function to dump the current state (token counts in places) for debugging
function dumpNetState(petriNet) {
    const state = {};
    for (const [id, place] of petriNet.places.entries()) {
        state[id] = place.tokens;
    }
    return state;
}


// == Potentially specific validation logic - assess if general purpose ==

/**
 * Validates a new connection within a specific card-based context.
 * NOTE: This seems specific to an application using cards and might not belong in a generic PetriNet utility.
 * Consider moving this logic to where it's used if it's not universally applicable.
 *
 * @param {Map<string, ArcInfo>} connections - Current connections map.
 * @param {ArcInfo} newConnection - The new connection to validate.
 * @param {Map<string, any>} cards - Map of cards (nodes/transitions) in the context.
 * @returns {{valid: boolean, message: string|null}}
 */
export function validateConnection(connections, newConnection, cards) {
    const { sourceId, targetId } = newConnection;

    // Basic validation: Check if source and target exist in cards
    if (!cards.has(sourceId)) {
        return { valid: false, message: `Source card ${sourceId} not found.` };
    }
    if (!cards.has(targetId)) {
        return { valid: false, message: `Target card ${targetId} not found.` };
    }

    // Prevent self-loops (connecting a node to itself)
    if (sourceId === targetId) {
        return { valid: false, message: "Cannot connect a node to itself." };
    }

    // Check for existing connection (prevent duplicates)
    const connectionId = `${sourceId}->${targetId}`;
    if (connections.has(connectionId)) {
        return { valid: false, message: "Connection already exists." };
    }

    // Check for reverse connection (prevent immediate cycles like A->B and B->A)
    const reverseConnectionId = `${targetId}->${sourceId}`;
    if (connections.has(reverseConnectionId)) {
        return { valid: false, message: "Reverse connection already exists." };
    }

    // Advanced cycle detection (optional, can be computationally expensive)
    // If needed, implement a graph traversal (like DFS) starting from targetId
    // to see if sourceId is reachable. This prevents larger cycles.
    // function detectsCycle(startNodeId, endNodeId) { ... }
    // if (detectsCycle(targetId, sourceId)) {
    //     return { valid: false, message: "Adding this connection would create a cycle." };
    // }

    // Type compatibility checks (if nodes have types, e.g., cannot connect two 'actions')
    const sourceCard = cards.get(sourceId);
    const targetCard = cards.get(targetId);
    // Example: Assuming cards have a 'type' property ('place' or 'transition')
    // if (sourceCard.type === 'transition' && targetCard.type === 'transition') {
    //    return { valid: false, message: "Cannot connect a transition directly to another transition." };
    // }
    // if (sourceCard.type === 'place' && targetCard.type === 'place') {
    //    return { valid: false, message: "Cannot connect a place directly to another place." };
    // }

    return { valid: true, message: null };
}


/**
 * Removes all arcs connected to a specific node (place or transition).
 * @param {PetriNet} petriNet - The Petri Net instance.
 * @param {string} nodeId - The ID of the node whose connections should be removed.
 */
const removeNodeConnections = (petriNet, nodeId) => {
    // Remove arcs where the node is the source
    const outputArcs = petriNet.outputArcsIndex.get(nodeId) || [];
    for (const arc of outputArcs) {
        const arcId = `${arc.sourceId}->${arc.targetId}`;
        petriNet.arcs.delete(arcId);
        // Remove from the target's input index
        const targetInputs = petriNet.inputArcsIndex.get(arc.targetId);
        if (targetInputs) {
            const index = targetInputs.findIndex(a => a.sourceId === nodeId);
            if (index !== -1) targetInputs.splice(index, 1);
        }
    }
    petriNet.outputArcsIndex.delete(nodeId);

    // Remove arcs where the node is the target
    const inputArcs = petriNet.inputArcsIndex.get(nodeId) || [];
    for (const arc of inputArcs) {
        const arcId = `${arc.sourceId}->${arc.targetId}`;
        petriNet.arcs.delete(arcId);
        // Remove from the source's output index
        const sourceOutputs = petriNet.outputArcsIndex.get(arc.sourceId);
        if (sourceOutputs) {
            const index = sourceOutputs.findIndex(a => a.targetId === nodeId);
            if (index !== -1) sourceOutputs.splice(index, 1);
        }
    }
    petriNet.inputArcsIndex.delete(nodeId);

    // Re-evaluate entry/exit status after removal (could be complex, might need full rebuild)
    // Simple approach: Assume it might become an entry/exit again if it still exists
    if (petriNet.places.has(nodeId)){
        // Recheck if it has become an entry or exit node. Requires checking remaining connections.
        // This is complex. A simpler approach might be needed, or a full index rebuild.
        // For now, let's just add them back potentially, rebuild index might be better.
        // This part needs careful consideration based on use case.
        // petriNet.entryPlaceIndex.add(nodeId); // Potentially incorrect
        // petriNet.exitPlaceIndex.add(nodeId); // Potentially incorrect
         console.warn("Entry/Exit index might be inaccurate after node connection removal without rebuild.");
    }
};

// Potential export for direct use if needed, though curried versions are primary
export { executePetriNet, isTransitionEnabled, fireTransition, removeNodeConnections }; 