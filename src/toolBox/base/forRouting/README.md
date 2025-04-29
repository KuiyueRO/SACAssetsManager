# Routing Tools (`forRouting`)

This directory provides base-level tools for handling routing, primarily for backend or framework-level functionality, often compatible with Koa.js middleware patterns.

## Scope

*   Core routing logic (e.g., using `radix3` via `useDeps`).
*   Route registration with documentation enforcement.
*   Route grouping and prefixing.
*   Generation of Koa-compatible middleware (`routes`, `allowedMethods`).
*   Generation of OpenAPI documentation from registered routes.
*   Global router instance management (singleton pattern).
*   Meta API endpoints for route introspection and testing.

## Dependencies

*   `../useDeps/radix3/koaRouter.js`: Assumes a Koa-compatible router implementation based on `radix3` is provided via the `useDeps` layer.

## Files

*   `functionRouter.js`: Defines the `FunctionRouter` class and `createFunctionRouter` factory, providing the core routing logic with documentation features.
*   `globalRouter.js`: Manages a global singleton instance of `FunctionRouter` and provides convenient registration functions (`get`, `post`, `groupRoutes`, etc.) and middleware generators.
*   `metaApi.js`: Provides `useRouting_addMetaApiEndpoints` to add `/meta` endpoints (list routes, test routes) to a `FunctionRouter` instance.
*   `AInote.md`: Internal notes for AI.

## Usage

Typically, you would initialize the global router once and then use the registration functions.

```javascript
import {
  initGlobalRouter,
  get,
  post,
  getRouterMiddleware,
  getAllowedMethodsMiddleware,
  generateApiDocs
} from 'path/to/toolBox/base/forRouting/globalRouter.js';
import { useRouting_addMetaApiEndpoints } from 'path/to/toolBox/base/forRouting/metaApi.js';

// Initialize the global router (e.g., at application startup)
const router = initGlobalRouter({ enforceDocumentation: true });

// Add meta endpoints (optional)
useRouting_addMetaApiEndpoints(router, { prefix: '/dev-meta' });

// Register routes
get('/users', {
  summary: 'List users',
  description: 'Retrieves a list of all users.',
  tags: ['users'],
  params: { /* ... OpenAPI param docs ... */ },
  response: { '200': { description: 'User list', type: 'array' } }
}, async (ctx) => {
  // ... handler logic ...
  ctx.body = [{ id: 1, name: 'Alice' }];
});

post('/users', { /* ... doc ... */ }, async (ctx) => {
  // ... handler logic ...
});

// Generate Koa middleware
const app = new Koa(); // Assuming Koa app
app.use(getRouterMiddleware());
app.use(getAllowedMethodsMiddleware());

// Generate OpenAPI docs (e.g., for a /docs endpoint)
const openApiDoc = generateApiDocs({ title: 'My API', version: '1.1' });
get('/docs', { /* ... doc ... */ }, ctx => {
  ctx.body = openApiDoc;
});

// Start your server...
``` 