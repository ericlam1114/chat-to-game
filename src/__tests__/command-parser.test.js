// src/__tests__/command-parser.test.js
const { parseGameCommand } = require('../app/lib/game-engine/command-parser');

test('parses add tree command', () => {
  const result = parseGameCommand('add a tree');
  expect(result.type).toBe('add');
  expect(result.component).toBe('tree');
});