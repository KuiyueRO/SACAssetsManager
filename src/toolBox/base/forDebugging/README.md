# Debugging Tools (`forDebugging`)

This directory provides general-purpose utilities to aid in debugging.

## Scope

*   Enhanced logging capabilities (e.g., adding caller location, formatting).
*   Performance measurement helpers.
*   Utilities for inspecting application state or environment during development.

## Current Files

*   `forConsoleEnhancement.js`: Provides `forEnhanceConsoleLog` to monkey-patch `console.log` with caller location and log limiting.

## Usage

Import functions directly from their respective files:

```javascript
import { forEnhanceConsoleLog } from 'path/to/toolBox/base/forDebugging/forConsoleEnhancement.js';

const restoreLog = forEnhanceConsoleLog();
console.log('This log will have caller info.');
// ... later
restoreLog(); // Restore original console.log
``` 