const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
require('ts-node/register');

const courseRoutes = require('../src/routes/courseRoutes').default;

test('course routes keep /lessons/:id before /:id to avoid shadowing', () => {
  const app = express();
  app.use('/api/courses', courseRoutes);

  const routePaths = app.router.stack[0].handle.stack
    .filter((layer) => layer.route)
    .map((layer) => layer.route.path);

  assert.ok(routePaths.includes('/lessons/:id'));
  assert.ok(routePaths.includes('/:id'));

  const lessonsIndex = routePaths.indexOf('/lessons/:id');
  const detailIndex = routePaths.indexOf('/:id');

  assert.ok(lessonsIndex !== -1, 'Expected /lessons/:id route to exist');
  assert.ok(detailIndex !== -1, 'Expected /:id route to exist');
  assert.ok(lessonsIndex < detailIndex, 'Expected /lessons/:id to be registered before /:id');
});
