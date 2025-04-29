# Everything Integration Tools (`forEverything`)

This directory contains feature-level tools for interacting with the Everything search engine (from voidtools).

## Scope

*   Communicating with the Everything HTTP service (querying, testing availability).
*   Parsing Everything File List (`.efu`) files.
*   Creating `.efu` files from file system data.

## Dependencies

*   Some functions require a Node.js environment (`fs` module) for file operations (e.g., `createEfuFile`, `fromEfuFile_parseContent`).
*   Functions interacting with the HTTP service require the `fetch` API.

## Files

*   `useEverythingApi.js`: Functions for querying the Everything HTTP service (`useEverything_search`, `useEverything_testService`, `formatEverythingSearchUrl`).
*   `createEfuFile.js`: Functions to create `.efu` files (`createEfuFile`, `formatEfuContent`).
*   `computeEfuData.js`: Pure functions to parse `.efu` content (`computeEfuDataFromString`, `computeUnixTimestampFromWindows`).
*   `fromEfuFile.js`: Functions to read data from `.efu` files or the file system (`fromEfuFile_parseContent`, `fromFs_getFileStats`, `fromFs_getBatchFileStats`).
*   `AInote.md`: Internal notes for AI.

## Usage

Import the required functions directly:

```javascript
import { useEverything_search } from 'path/to/toolBox/feature/forEverything/useEverythingApi.js';
import { fromEfuFile_parseContent } from 'path/to/toolBox/feature/forEverything/fromEfuFile.js';

async function searchEverything(query, port) {
  const result = await useEverything_search(query, port);
  if (result.enabled) {
    console.log('Found files:', result.fileList);
  }
}

async function readEfu(filePath) {
  const data = await fromEfuFile_parseContent(filePath);
  console.log('Parsed EFU data:', data);
} 