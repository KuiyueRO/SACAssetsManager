// @ts-nocheck
/**
 * @fileoverview Adds meta API endpoints to a FunctionRouter instance.
 * Provides endpoints to list routes, get route details, and test routes.
 */

// 默认认证处理，总是允许
async function defaultAuthHandler(ctx) {
  return true;
}

/**
 * Adds meta API endpoints to the given router instance.
 * @param {import('./functionRouter.js').FunctionRouter} router - The FunctionRouter instance.
 * @param {object} [options={}] - Configuration options.
 * @param {string} [options.prefix='/meta'] - API prefix for meta routes.
 * @param {boolean} [options.enabled=true] - Whether to enable meta routes.
 * @param {boolean} [options.requireAuth=false] - Whether authentication is required.
 * @param {function(object): Promise<boolean>} [options.authHandler=defaultAuthHandler] - Authentication handler function.
 * @returns {import('./functionRouter.js').FunctionRouter} The router instance with meta routes added (or the original if disabled).
 * @throws {Error} If the router instance is invalid or lacks required methods.
 */
export function useRouting_addMetaApiEndpoints(router, options = {}) {
  if (!router) {
    throw new Error('Router instance is required.');
  }

  const {
    prefix = '/meta',
    enabled = true,
    requireAuth = false,
    authHandler = defaultAuthHandler
  } = options;

  if (!enabled) {
    console.log('Meta API routes are disabled.');
    return router;
  }

  // Check if the router has necessary methods
  if (typeof router.get !== 'function' || typeof router.post !== 'function') {
    throw new Error('Provided router does not support required GET/POST methods.');
  }
  if (typeof router.getAllDocs !== 'function') {
    throw new Error('Provided router does not implement getAllDocs method.');
  }

  console.log(`Setting up Meta API endpoints at prefix: ${prefix}`);

  // Endpoint 1: Get all routes
  router.get(`${prefix}/routes`, {
    summary: 'Get All Registered Routes',
    description: 'Returns documentation for all registered routes in the system.',
    tags: ['meta'],
    response: {
      '200': {
        description: 'List of routes and their documentation.',
        type: 'object',
        properties: {
          routes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                method: { type: 'string', description: 'HTTP Method' },
                path: { type: 'string', description: 'Route path' },
                summary: { type: 'string' },
                description: { type: 'string' },
                docKey: { type: 'string', description: 'Internal documentation key (METHOD:path)' },
                params: { type: 'object', description: 'Parameters documentation' },
                response: { type: 'object', description: 'Response documentation' },
                registrationInfo: { type: 'string', nullable: true, description: 'Location where the route was registered' }
              }
            }
          }
        }
      }
      // Add other responses like 401/403 if auth is required
    }
  }, async (ctx) => {
    // Apply authentication check
    if (requireAuth && !(await authHandler(ctx))) {
      ctx.status = 401; // Or 403 depending on auth logic
      ctx.body = { error: 'Authentication required.' };
      return;
    }

    const allDocs = router.getAllDocs();
    const routes = [];

    // Convert docs format to route list
    for (const [key, doc] of Object.entries(allDocs)) {
      const [method, path] = key.split(':'); // Assumes key is "METHOD:path"
      routes.push({
        method,
        path,
        summary: doc.summary || 'No summary',
        description: doc.description || 'No description',
        docKey: key,
        params: doc.params || {},
        response: doc.response || { '200': { description: 'Success' } },
        registrationInfo: doc.registrationInfo || null
      });
    }

    ctx.body = { routes };
  });

  // Endpoint 2: Get details for a specific route
  router.get(`${prefix}/routes/:docKey`, {
    summary: 'Get Specific Route Details',
    description: 'Retrieves detailed documentation for a specific route using its documentation key (METHOD:path).',
    tags: ['meta'],
    params: {
      docKey: {
        type: 'string',
        description: 'Route documentation key (e.g., \"GET:/users/:id\")',
        required: true
      }
    },
    response: {
        '200': {
            description: 'Detailed route documentation.',
            type: 'object',
            properties: { route: { type: 'object' } } // Define schema for route details
        },
        '404': { description: 'Route not found.' }
      // Add other responses like 401/403 if auth is required
    }
  }, async (ctx) => {
    // Apply authentication check
    if (requireAuth && !(await authHandler(ctx))) {
       ctx.status = 401;
       ctx.body = { error: 'Authentication required.' };
      return;
    }

    const { docKey } = ctx.params;
    const allDocs = router.getAllDocs();

    if (!allDocs[docKey]) {
      ctx.status = 404;
      ctx.body = { error: 'Route not found.' };
      return;
    }

    const doc = allDocs[docKey];
    const [method, path] = docKey.split(':');

    ctx.body = {
      route: {
        method,
        path,
        summary: doc.summary || 'No summary',
        description: doc.description || 'No description',
        params: doc.params || {},
        response: doc.response || { '200': { description: 'Success' } },
        registrationInfo: doc.registrationInfo || null
      }
    };
  });

  // Endpoint 3: Test a specific route
  router.post(`${prefix}/test`, {
    summary: 'Test Specific Route',
    description: 'Sends a request to the specified route and returns the response. Useful for API exploration and testing.',
    tags: ['meta'],
    // Define request body schema using OpenAPI standard if possible
    requestBody: {
        required: true,
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        method: { type: 'string', description: 'HTTP method (e.g., GET, POST)', required: true },
                        path: { type: 'string', description: 'Route path (e.g., /users/:id)', required: true },
                        pathParams: { type: 'object', description: 'Parameters to substitute in the path (e.g., { id: 123 })' },
                        queryParams: { type: 'object', description: 'URL query parameters' },
                        bodyParams: { type: 'object', description: 'Request body parameters (usually for POST, PUT, PATCH)' },
                        headers: { type: 'object', description: 'Custom request headers' }
                    }
                }
            }
        }
    },
    response: {
      '200': {
        description: 'Result of the test request.',
        type: 'object',
        properties: {
          result: { type: 'any', description: 'Response body (parsed JSON or text)' },
          status: { type: 'number', description: 'HTTP status code of the response' },
          headers: { type: 'object', description: 'Response headers' },
          timing: { type: 'number', description: 'Request duration in milliseconds' }
        }
      },
      '500': { description: 'Error occurred during test execution.' }
      // Add other responses like 401/403 if auth is required
    }
  }, async (ctx) => {
    // Apply authentication check
    if (requireAuth && !(await authHandler(ctx))) {
      ctx.status = 401;
      ctx.body = { error: 'Authentication required.' };
      return;
    }

    // Validate request body (basic check)
    if (!ctx.request.body || typeof ctx.request.body !== 'object') {
        ctx.status = 400;
        ctx.body = { error: 'Invalid request body.' };
        return;
    }

    const {
        method,
        path,
        pathParams = {},
        queryParams = {},
        bodyParams = {},
        headers = {}
    } = ctx.request.body;

    if (!method || !path) {
        ctx.status = 400;
        ctx.body = { error: 'Missing required fields: method and path.' };
        return;
    }

    try {
      // Substitute path parameters
      let testPath = path;
      for (const [key, value] of Object.entries(pathParams)) {
        testPath = testPath.replace(`:${key}`, encodeURIComponent(String(value)));
        // Also handle {key} style if the router uses that internally
        testPath = testPath.replace(`{${key}}`, encodeURIComponent(String(value)));
      }

      // Construct full URL (assuming API runs on the same origin for fetch)
      // This might be brittle. A better approach might involve internal dispatching.
      // TODO: Re-evaluate using fetch for internal route testing.
      const protocol = ctx.protocol;
      const host = ctx.host; // Get host from the current request context
      let testUrl = `${protocol}://${host}${testPath}`;

      // Add query parameters
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(queryParams)) {
        searchParams.append(key, String(value));
      }
      if (searchParams.toString()) {
        testUrl += `?${searchParams.toString()}`;
      }

      const startTime = Date.now();

      // Perform the fetch request
      const response = await fetch(testUrl, {
        method: method.toUpperCase(),
        headers: {
          'Content-Type': 'application/json',
          ...headers // Allow overriding headers
        },
        body: (method.toUpperCase() !== 'GET' && method.toUpperCase() !== 'HEAD' && Object.keys(bodyParams).length > 0)
              ? JSON.stringify(bodyParams)
              : undefined
      });

      const endTime = Date.now();

      // Process the response
      const responseStatus = response.status;
      const responseHeaders = {};
      response.headers.forEach((value, key) => { responseHeaders[key] = value; });

      let responseBody;
      try {
        // Attempt to parse as JSON, fall back to text
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          responseBody = await response.json();
        } else {
          responseBody = await response.text();
        }
      } catch (parseError) {
        console.warn('Could not parse response body:', parseError);
        responseBody = await response.text(); // Fallback to raw text
      }

      ctx.status = 200;
      ctx.body = {
        result: responseBody,
        status: responseStatus,
        headers: responseHeaders,
        timing: endTime - startTime
      };

    } catch (error) {
      console.error('Error during meta API route test:', error);
      ctx.status = 500;
      ctx.body = { error: `Internal error during test: ${error.message}` };
    }
  });

  console.log('Meta API routes setup complete.');
  return router;
} 