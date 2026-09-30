#!/usr/bin/env node

import { generateSupersetThemes } from '../lib/converter.js';
import path from 'path';

const args = process.argv.slice(2);
// Check if user explicitly typed a route parameter: e.g. `npx shadcn-superset-themer ./styles/custom.css`
const customPathArg = args[0] || null;

try {
  console.log("✨ Starting Shadcn to Apache Superset conversion...");
  generateSupersetThemes(customPathArg, process.cwd());
  console.log("🎉 Success! Config files built into your current directory workspace.");
} catch (error) {
  console.error("❌ Conversion process aborted:", error.message);
  console.error(error);
  process.exit(1);
}
