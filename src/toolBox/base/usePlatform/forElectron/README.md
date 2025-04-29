# Electron Platform Tools (`forElectron`)

This directory contains base utilities specifically for interacting with the Electron framework.

## Scope

*   Wrappers around Electron APIs (`BrowserWindow`, `ipcMain`, `ipcRenderer`, `webContents`, etc.).
*   Functions for managing Electron windows, processes, and inter-process communication (IPC).
*   Utilities addressing Electron-specific behaviors or platform interactions.

## Current Files

*   `getWindowsByURL.js`: Provides a function `getAllWindowsByURL` to find open `BrowserWindow` instances matching a specific URL.

## Usage

Import functions directly from their respective files:

```javascript
import { getAllWindowsByURL } from 'path/to/toolBox/base/usePlatform/forElectron/getWindowsByURL.js';

const matchingWindows = getAllWindowsByURL('http://example.com/page');
``` 