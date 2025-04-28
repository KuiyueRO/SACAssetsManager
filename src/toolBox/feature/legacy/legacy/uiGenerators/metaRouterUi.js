/**
 * @fileoverview Generates HTML, CSS, and JS for a meta router UI.
 * @deprecated This approach of generating complex UI strings in the backend is highly discouraged.
 *             It's hard to maintain, debug, and extend.
 *             Consider building a separate frontend application using a modern framework (Vue, React, Svelte)
 *             that consumes the meta API endpoints (`/meta/routes`, `/meta/test`).
 */

/**
 * Generates the complete HTML, CSS, and JavaScript for the meta router UI page.
 * @param {string} prefix - The prefix used for the meta API endpoints (e.g., '/meta').
 * @returns {string} The full HTML page content as a string.
 */
export function generateLegacyMetaRouterUiHtml(prefix) {
  // ** WARNING **: This function generates a large block of HTML/CSS/JS as a string.
  // This is generally bad practice and kept here for legacy reasons or until a proper frontend is built.

  // TODO: Refactor this entire function. Ideally, remove it and build a separate frontend UI.
  //       If removal is not possible immediately, consider:
  //       1. Using a template engine instead of raw string concatenation.
  //       2. Separating CSS and JS into their own sections or potentially linked files (if possible within the context).
  //       3. Simplifying the inline JavaScript logic.

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Meta Router UI (Legacy)</title>
  <style>
    /* CSS styles (kept inline for now, should be externalized) */
    :root {
      --primary-color: #4f46e5; --primary-hover: #4338ca; --bg-color: #f9fafb;
      --card-bg: #ffffff; --text-color: #1f2937; --text-secondary: #6b7280;
      --border-color: #e5e7eb; --success-color: #10b981; --error-color: #ef4444;
      --warning-color: #f59e0b; --info-color: #3b82f6;
      --method-get-bg: #dbeafe; --method-get-text: #1e40af;
      --method-post-bg: #dcfce7; --method-post-text: #166534;
      --method-put-bg: #fef3c7; --method-put-text: #92400e;
      --method-delete-bg: #fee2e2; --method-delete-text: #b91c1c;
      --method-patch-bg: #e0e7ff; --method-patch-text: #3730a3;
      --method-options-bg: #f3e8ff; --method-options-text: #581c87;
      --method-head-bg: #e0f2fe; --method-head-text: #075985;
      --method-other-bg: #f3f4f6; --method-other-text: #4b5563;
      --code-bg: #1e293b; --code-text: #e2e8f0;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: var(--bg-color); color: var(--text-color); line-height: 1.6; padding-bottom: 50px; }
    .container { max-width: 1200px; margin: 20px auto; padding: 0 20px; }
    header { margin-bottom: 30px; text-align: center; border-bottom: 1px solid var(--border-color); padding-bottom: 20px; }
    h1 { color: var(--primary-color); margin-bottom: 5px; }
    .subtitle { color: var(--text-secondary); font-size: 1rem; }
    .card { background-color: var(--card-bg); border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03); margin-bottom: 30px; overflow: hidden; border: 1px solid var(--border-color); }
    .card-header { padding: 15px 20px; border-bottom: 1px solid var(--border-color); background-color: #fdfdff; }
    .card-title { font-size: 1.2rem; font-weight: 600; }
    .card-body { padding: 20px; }
    .loading, .error-message { text-align: center; padding: 40px 20px; color: var(--text-secondary); font-size: 1.1rem; }
    .error-message { color: var(--error-color); background-color: #fff1f2; border: 1px solid #ffdfe2; border-radius: 6px; }
    #routeList { list-style: none; max-height: 500px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 6px; }
    .route-item { display: flex; align-items: center; padding: 10px 15px; border-bottom: 1px solid var(--border-color); cursor: pointer; transition: background-color 0.15s ease-in-out; }
    .route-item:last-child { border-bottom: none; }
    .route-item:hover { background-color: #f0f4ff; }
    .route-item.active { background-color: #e8edff; font-weight: 500; }
    .route-method { padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-right: 12px; min-width: 65px; text-align: center; }
    .method-get { background-color: var(--method-get-bg); color: var(--method-get-text); }
    /* ... other method styles ... */
    .method-post { background-color: var(--method-post-bg); color: var(--method-post-text); }
    .method-put { background-color: var(--method-put-bg); color: var(--method-put-text); }
    .method-delete { background-color: var(--method-delete-bg); color: var(--method-delete-text); }
    .method-patch { background-color: var(--method-patch-bg); color: var(--method-patch-text); }
    .method-options { background-color: var(--method-options-bg); color: var(--method-options-text); }
    .method-head { background-color: var(--method-head-bg); color: var(--method-head-text); }
    .method-other { background-color: var(--method-other-bg); color: var(--method-other-text); }
    .route-path { font-family: 'Fira Code', monospace; font-size: 0.9rem; flex-grow: 1; word-break: break-all; }
    .route-summary { color: var(--text-secondary); font-size: 0.85rem; margin-left: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 250px; }
    #routeDetails { margin-top: 30px; }
    .details-section { margin-bottom: 20px; }
    .details-label { display: block; font-weight: 600; margin-bottom: 6px; font-size: 0.9rem; color: var(--primary-color); }
    .details-value, .details-description { font-size: 0.95rem; margin-bottom: 10px; }
    .code-block { background-color: var(--code-bg); color: var(--code-text); padding: 15px; border-radius: 6px; font-family: 'Fira Code', monospace; font-size: 0.85rem; white-space: pre-wrap; overflow-x: auto; margin-top: 5px; border: 1px solid #374151; }
    .tabs { display: flex; border-bottom: 1px solid var(--border-color); margin-bottom: 20px; }
    .tab { padding: 10px 15px; cursor: pointer; border-bottom: 3px solid transparent; margin-bottom: -1px; font-size: 0.95rem; color: var(--text-secondary); }
    .tab.active { border-bottom-color: var(--primary-color); color: var(--primary-color); font-weight: 600; }
    .tab-content { display: none; }
    .tab-content.active { display: block; }
    .test-form label { display: block; margin-bottom: 5px; font-weight: 500; font-size: 0.9rem; }
    .test-form textarea, .test-form input[type="text"] { width: 100%; padding: 10px; border-radius: 4px; border: 1px solid var(--border-color); font-family: inherit; font-size: 0.9rem; margin-bottom: 15px; background-color: #fdfdff; }
    .test-form textarea { min-height: 100px; font-family: 'Fira Code', monospace; }
    .btn { background-color: var(--primary-color); color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: 500; transition: background-color 0.2s; display: inline-block; }
    .btn:hover { background-color: var(--primary-hover); }
    .btn:disabled { background-color: #d1d5db; cursor: not-allowed; }
    #testResponse { margin-top: 20px; }
    #testResponse h3 { margin-bottom: 10px; font-size: 1.1rem; }
    #responseStatus { font-weight: bold; padding: 3px 8px; border-radius: 4px; display: inline-block; margin-left: 10px; font-size: 0.9rem; }
    .status-success { background-color: var(--success-color); color: white; }
    .status-error { background-color: var(--error-color); color: white; }
    .status-info { background-color: var(--info-color); color: white; }
    .status-warn { background-color: var(--warning-color); color: white; }
    .response-headers { margin-top: 15px; }
    .filter-input { padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 6px; margin-bottom: 15px; width: 100%; font-size: 0.95rem; }
    .registration-info { font-size: 0.8rem; color: var(--text-secondary); margin-top: 8px; font-style: italic; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>API Meta Router</h1>
      <p class="subtitle">Explore and test registered API routes.</p>
    </header>

    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Registered Routes</h2>
      </div>
      <div class="card-body">
        <input type="text" id="routeFilter" class="filter-input" placeholder="Filter routes by path or summary...">
        <div id="loadingRoutes" class="loading">Loading routes...</div>
        <div id="errorRoutes" class="error-message" style="display: none;"></div>
        <ul id="routeList"></ul>
      </div>
    </div>

    <div id="routeDetails" class="card" style="display: none;">
      <div class="card-header">
        <h2 class="card-title" id="detailsTitle">Route Details</h2>
      </div>
      <div class="card-body">
        <div class="tabs">
          <div class="tab active" data-tab="info">Info</div>
          <div class="tab" data-tab="test">Test</div>
        </div>

        <div id="tabContentInfo" class="tab-content active">
          <div class="details-section">
            <span class="details-label">Method:</span>
            <span id="detailsMethod" class="route-method"></span>
          </div>
          <div class="details-section">
            <span class="details-label">Path:</span>
            <div id="detailsPath" class="code-block" style="background-color: #f0f4ff; color: var(--text-color); border: 1px solid #d6e0ff;"></div>
          </div>
           <div class="details-section">
            <span class="details-label">Summary:</span>
            <div id="detailsSummary" class="details-value"></div>
          </div>
          <div class="details-section">
            <span class="details-label">Description:</span>
            <div id="detailsDescription" class="details-description"></div>
          </div>
          <div class="details-section">
            <span class="details-label">Parameters:</span>
            <div id="detailsParams" class="code-block"></div>
          </div>
          <div class="details-section">
            <span class="details-label">Responses:</span>
            <div id="detailsResponse" class="code-block"></div>
          </div>
           <div id="registrationInfoSection" class="details-section" style="display: none;">
                <span class="details-label">Registered At:</span>
                <div id="detailsRegistrationInfo" class="registration-info"></div>
            </div>
        </div>

        <div id="tabContentTest" class="tab-content">
          <form id="testForm" class="test-form">
            <p style="margin-bottom: 15px; color: var(--text-secondary);">Test the <code id="testFormPath"></code> endpoint.</p>
            <div class="form-group">
              <label for="pathParams">Path Parameters (JSON):</label>
              <textarea id="pathParams" class="form-input" rows="2" placeholder='{
  "userId": 123
}'></textarea>
            </div>
            <div class="form-group">
              <label for="queryParams">Query Parameters (JSON):</label>
              <textarea id="queryParams" class="form-input" rows="2" placeholder='{
  "limit": 10,
  "sort": "desc"
}'></textarea>
            </div>
            <div class="form-group">
              <label for="bodyParams">Body Parameters (JSON):</label>
              <textarea id="bodyParams" class="form-input" rows="4" placeholder='{
  "name": "Example",
  "value": true
}'></textarea>
            </div>
            <div class="form-group">
              <label for="headers">Headers (JSON):</label>
              <textarea id="headers" class="form-input" rows="2" placeholder='{
  "X-Custom-Header": "value"
}'></textarea>
            </div>
            <button type="submit" id="sendTestRequestBtn" class="btn">Send Request</button>
          </form>
          <div id="testResponse">
             <div id="loadingTest" class="loading" style="display: none; padding: 20px 0;">Sending request...</div>
             <div id="errorTest" class="error-message" style="display: none; margin-top: 15px;"></div>
             <div id="responseContainer" style="display: none;">
                <h3>Response <span id="responseStatus"></span></h3>
                <div class="details-section">
                    <span class="details-label">Timing:</span>
                    <span id="responseTime"></span> ms
                </div>
                 <div class="details-section response-headers">
                    <span class="details-label">Response Headers:</span>
                    <div id="responseHeaders" class="code-block"></div>
                </div>
                <div class="details-section">
                    <span class="details-label">Response Body:</span>
                    <div id="responseBody" class="code-block"></div>
                 </div>
             </div>
          </div>
        </div>
      </div>
    </div>

  </div>

  <script>
    // Inline JavaScript (should be externalized and improved)
    const API_PREFIX = '${prefix}';
    let allRoutes = [];
    let currentRoute = null;

    const loadingRoutesEl = document.getElementById('loadingRoutes');
    const errorRoutesEl = document.getElementById('errorRoutes');
    const routeListEl = document.getElementById('routeList');
    const routeFilterEl = document.getElementById('routeFilter');
    const routeDetailsEl = document.getElementById('routeDetails');
    const detailsTitleEl = document.getElementById('detailsTitle');
    const detailsMethodEl = document.getElementById('detailsMethod');
    const detailsPathEl = document.getElementById('detailsPath');
    const detailsSummaryEl = document.getElementById('detailsSummary');
    const detailsDescriptionEl = document.getElementById('detailsDescription');
    const detailsParamsEl = document.getElementById('detailsParams');
    const detailsResponseEl = document.getElementById('detailsResponse');
    const registrationInfoSectionEl = document.getElementById('registrationInfoSection');
    const detailsRegistrationInfoEl = document.getElementById('detailsRegistrationInfo');

    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    const testFormEl = document.getElementById('testForm');
    const testFormPathEl = document.getElementById('testFormPath');
    const pathParamsEl = document.getElementById('pathParams');
    const queryParamsEl = document.getElementById('queryParams');
    const bodyParamsEl = document.getElementById('bodyParams');
    const headersEl = document.getElementById('headers');
    const sendTestRequestBtnEl = document.getElementById('sendTestRequestBtn');
    const loadingTestEl = document.getElementById('loadingTest');
    const errorTestEl = document.getElementById('errorTest');
    const responseContainerEl = document.getElementById('responseContainer');
    const responseStatusEl = document.getElementById('responseStatus');
    const responseTimeEl = document.getElementById('responseTime');
    const responseHeadersEl = document.getElementById('responseHeaders');
    const responseBodyEl = document.getElementById('responseBody');

    // --- Helper Functions ---
    function safeJsonParse(str, defaultValue = null) {
        try {
            return JSON.parse(str);
        } catch (e) {
            return defaultValue;
        }
    }

    function formatJson(data) {
        try {
            return JSON.stringify(data, null, 2);
        } catch (e) {
            return String(data);
        }
    }

    function getMethodClass(method) {
        const lowerMethod = method.toLowerCase();
        if (['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(lowerMethod)) {
            return \`method-\${lowerMethod}\`;
        }
        return 'method-other';
    }

    function displayError(el, message) {
        el.textContent = \`Error: \${message}\`;
        el.style.display = 'block';
    }

    function clearError(el) {
        el.textContent = '';
        el.style.display = 'none';
    }

    function renderRouteList(routes) {
        routeListEl.innerHTML = ''; // Clear previous list
        if (!routes || routes.length === 0) {
            routeListEl.innerHTML = '<li style="padding: 20px; color: var(--text-secondary); text-align: center;">No routes found.</li>';
            return;
        }
        routes.forEach(route => {
            const li = document.createElement('li');
            li.classList.add('route-item');
            li.dataset.docKey = route.docKey;
            li.innerHTML = \`
                <span class="route-method ${getMethodClass(route.method)}">${route.method}</span>
                <span class="route-path">${route.path}</span>
                <span class="route-summary">${route.summary}</span>
            \`;
            li.addEventListener('click', () => {
                loadRouteDetails(route.docKey);
                 // Highlight active item
                 document.querySelectorAll('.route-item.active').forEach(el => el.classList.remove('active'));
                 li.classList.add('active');
            });
            routeListEl.appendChild(li);
        });
    }

    function filterRoutes() {
        const filterText = routeFilterEl.value.toLowerCase();
        const filteredRoutes = allRoutes.filter(route => {
            return route.path.toLowerCase().includes(filterText) ||
                   route.summary.toLowerCase().includes(filterText);
        });
        renderRouteList(filteredRoutes);
    }

    async function loadRoutes() {
        loadingRoutesEl.style.display = 'block';
        clearError(errorRoutesEl);
        routeListEl.innerHTML = '';
        routeDetailsEl.style.display = 'none';

        try {
            const response = await fetch(\`${API_PREFIX}/routes\`);
            if (!response.ok) {
                throw new Error(\`HTTP error! status: \${response.status}\`);
            }
            const data = await response.json();
            allRoutes = data.routes || [];
            allRoutes.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method)); // Sort routes
            renderRouteList(allRoutes);
        } catch (error) {
            console.error('Failed to load routes:', error);
            displayError(errorRoutesEl, error.message || 'Could not fetch routes.');
            allRoutes = [];
            renderRouteList(allRoutes);
        } finally {
            loadingRoutesEl.style.display = 'none';
        }
    }

    function displayRouteDetails(route) {
        currentRoute = route;
        detailsTitleEl.textContent = \`Route: \${route.method} \${route.path}\`;
        detailsMethodEl.textContent = route.method;
        detailsMethodEl.className = \`route-method \${getMethodClass(route.method)}\`;
        detailsPathEl.textContent = route.path;
        detailsSummaryEl.textContent = route.summary;
        detailsDescriptionEl.textContent = route.description;
        detailsParamsEl.textContent = formatJson(route.params);
        detailsResponseEl.textContent = formatJson(route.response);

        if (route.registrationInfo) {
            detailsRegistrationInfoEl.textContent = route.registrationInfo;
            registrationInfoSectionEl.style.display = 'block';
        } else {
            registrationInfoSectionEl.style.display = 'none';
        }

        // Reset test form and response
        testFormPathEl.textContent = \`\${route.method} \${route.path}\`;
        pathParamsEl.value = '';
        queryParamsEl.value = '';
        bodyParamsEl.value = '';
        headersEl.value = '';
        clearError(errorTestEl);
        responseContainerEl.style.display = 'none';
        loadingTestEl.style.display = 'none';
        sendTestRequestBtnEl.disabled = false;

        // Show details section and switch to info tab by default
        routeDetailsEl.style.display = 'block';
        switchTab('info');
        window.scrollTo({ top: routeDetailsEl.offsetTop - 20, behavior: 'smooth' });
    }

    async function loadRouteDetails(docKey) {
        // Fetching details again, though we have them from the list...
        // Could optimize by directly using the data from allRoutes
        // For now, keeping it simple to match potential API structure
        try {
            // Simulate loading state if needed
            const routeFromList = allRoutes.find(r => r.docKey === docKey);
            if (routeFromList) {
                displayRouteDetails(routeFromList);
            } else {
                // Optionally fetch from /routes/:docKey if needed
                 console.warn('Route not found in the loaded list, this should not happen.');
                 routeDetailsEl.style.display = 'none'; // Hide details
            }
        } catch (error) {
            console.error('Failed to load route details:', error);
            // Show error in the details section?
             routeDetailsEl.style.display = 'none'; // Hide details
        }
    }

    function switchTab(targetTabId) {
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === targetTabId);
        });
        tabContents.forEach(content => {
            content.classList.toggle('active', content.id === \`tabContent\${targetTabId.charAt(0).toUpperCase() + targetTabId.slice(1)}\`);
        });
    }

    async function handleTestSubmit(event) {
        event.preventDefault();
        if (!currentRoute) return;

        const pathParams = safeJsonParse(pathParamsEl.value, {});
        const queryParams = safeJsonParse(queryParamsEl.value, {});
        const bodyParams = safeJsonParse(bodyParamsEl.value, {});
        const headers = safeJsonParse(headersEl.value, {});

        loadingTestEl.style.display = 'block';
        clearError(errorTestEl);
        responseContainerEl.style.display = 'none';
        sendTestRequestBtnEl.disabled = true;

        try {
            const response = await fetch(\`${API_PREFIX}/test\`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    method: currentRoute.method,
                    path: currentRoute.path,
                    pathParams,
                    queryParams,
                    bodyParams,
                    headers
                })
            });

            if (!response.ok) {
                 let errorData = { message: \`HTTP error! status: \${response.status}\` };
                 try {
                     errorData = await response.json();
                 } catch(e){ /* ignore */ }
                throw new Error(errorData.error || errorData.message || \`Request failed with status \${response.status}\`);
            }

            const data = await response.json();

            // Display response
            const res = data.testResponse;
            responseStatusEl.textContent = res.status;
            responseStatusEl.className = ''; // Clear previous classes
            if (res.status >= 200 && res.status < 300) responseStatusEl.classList.add('status-success');
            else if (res.status >= 400) responseStatusEl.classList.add('status-error');
            else if (res.status >= 300) responseStatusEl.classList.add('status-info');

            responseTimeEl.textContent = res.timing;
            responseHeadersEl.textContent = formatJson(res.headers);
            responseBodyEl.textContent = formatJson(res.result);
            responseContainerEl.style.display = 'block';

        } catch (error) {
            console.error('Test request failed:', error);
            displayError(errorTestEl, error.message || 'Failed to execute test request.');
        } finally {
            loadingTestEl.style.display = 'none';
            sendTestRequestBtnEl.disabled = false;
        }
    }

    // --- Event Listeners ---
    routeFilterEl.addEventListener('input', filterRoutes);
    tabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
    testFormEl.addEventListener('submit', handleTestSubmit);

    // --- Initial Load ---
    loadRoutes();

  </script>
</body>
</html>`;
} 