import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { findCssFile, generateSupersetThemes } from '../lib/converter.js';

test('CSS file path resolution throws or finds correctly', () => {
  assert.throws(() => {
    findCssFile('./non-existent-path-12345.css');
  }, /CSS file path does not exist/);
});

test('Theme generator parses CSS content and builds valid JSON/YAML structure', (t) => {
  const dummyCss = `
    :root {
      --background: 0 0% 100%;
      --foreground: 240 10% 3.9%;
      --primary: 240 5.9% 10%;
      --destructive: 0 84.2% 60.2%;
      --radius: 0.5rem;
    }
    .dark {
      --background: 240 10% 3.9%;
      --foreground: 0 0% 98%;
      --primary: 0 0% 98%;
      --destructive: 0 62.8% 30.6%;
    }
  `;
  
  const testDir = path.resolve('./test-temp-output');
  if (!fs.existsSync(testDir)) fs.mkdirSync(testDir);
  
  const tempCssPath = path.join(testDir, 'globals.css');
  fs.writeFileSync(tempCssPath, dummyCss);

  const result = generateSupersetThemes(tempCssPath, testDir);

  assert.equal(result.lightYamlStructure.json_data.algorithm, 'default');
  assert.equal(result.darkYamlStructure.json_data.algorithm, 'dark');
  assert.equal(result.lightYamlStructure.json_data.token.borderRadius, 8);

  // Clean up temporary testing artifacts
  //fs.rmSync(testDir, { recursive: true, force: true });
});
