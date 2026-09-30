# superset-themer

Convert your [shadcn/ui](https://shadcn.com) `globals.css` theme variables directly into Apache Superset-compatible JSON and YAML theme configurations (supporting both light and dark modes).

## Installation

Run it instantly via npx (no installation required):
\`\`\`bash
npx superset-themer
\`\`\`

Or install it locally in your project:
\`\`\`bash
npm install --save-dev superset-themer
\`\`\`

## Usage

By default, the tool scans common paths (`./src/app/globals.css`, `./src/index.css`, etc.) for your shadcn variables. You can also pass a custom file path explicitly:
\`\`\`bash
npx superset-themer ./path/to/globals.css
\`\`\`

### Environment Variables
Set `SHADCN_CSS_PATH` in your environment or automation scripts to target a specific file:
\`\`\`bash
SHADCN_CSS_PATH=./styles/globals.css npx superset-themer
\`\`\`
