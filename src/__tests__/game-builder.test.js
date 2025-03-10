// src/__tests__/game-builder.test.js
const { GameBuilder } = require('../app/lib/game-engine/game-builder');
require('../app/lib/game-engine/components');

test('builds a basic game', () => {
  const builder = new GameBuilder();
  builder.addComponent('base');
  builder.addComponent('ground');
  const code = builder.build();
  expect(code).toContain('Game initialization');
  expect(code).toContain('Add ground');
});