# PDF.js Integration Tools (`forPdfJs`)

This directory provides wrappers and utilities for interacting with the PDF.js library (`pdfjs-dist`).

## Scope

*   Functions for loading, parsing, and rendering PDF documents using PDF.js.
*   Extracting information from PDFs (e.g., page count).
*   Converting PDF pages to images (requires browser Canvas API).

## Dependencies

*   **PDF.js library (`pdfjs-dist`):** This module assumes `pdfjsLib` is available globally or properly imported. The setup of `pdfjsLib.GlobalWorkerOptions.workerSrc` is crucial and must be handled by the consuming application.
*   **Browser Environment:** Some functions, particularly those involving rendering (`getPdfPageAsImage`), require a browser environment with Canvas API support.

## Files

*   `fromPdf.js`: Contains functions like `getPdfPageCount` and `getPdfPageAsImage`.
*   `AInote.md`: Internal notes for AI.

## Usage

Ensure PDF.js is loaded and configured before using these functions.

```javascript
// --- Application Setup (Example) ---
// import * as pdfjsLib from 'pdfjs-dist/build/pdf';
// import workerSrc from 'pdfjs-dist/build/pdf.worker.entry'; // Or path to worker file
// pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
// window.pdfjsLib = pdfjsLib; // Make it global if needed
// ------------------------------------

import { getPdfPageCount, getPdfPageAsImage } from 'path/to/toolBox/base/useDeps/forPdfJs/fromPdf.js';

async function processPdf(pdfSource) {
  try {
    const numPages = await getPdfPageCount(pdfSource);
    console.log('Total Pages:', numPages);

    if (numPages > 0) {
      const firstPageImage = await getPdfPageAsImage(pdfSource, 1);
      // Use the base64 image data
      const imgElement = document.createElement('img');
      imgElement.src = firstPageImage;
      document.body.appendChild(imgElement);
    }
  } catch (error) {
    console.error('Failed to process PDF:', error);
  }
}

// Example usage with a URL
// processPdf('/path/to/my_document.pdf');
```

**Important:** The PDF.js worker setup (`pdfjsLib.GlobalWorkerOptions.workerSrc`) is essential for performance and functionality. Refer to the PDF.js documentation for correct configuration in your specific environment. 