# superset-themer

Convert your shadcn/ui theme variables into Apache Superset theme files for both light and dark modes.

This package reads your CSS custom properties from a shadcn-style theme file and generates ready-to-import Superset JSON and YAML theme payloads. It is designed for developers who want to quickly turn a Tailwind/shadcn design system into a matching Superset dashboard theme without manually rewriting color values into Superset config objects.

## Why use this package?

If your app already uses shadcn/ui tokens such as:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --primary: 221.2 83.2% 53.3%;
  --destructive: 0 84.2% 60.2%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --primary: 217.2 91.1% 59.9%;
  --destructive: 0 72.2% 50.8%;
}
```

this package can generate Superset theme configuration that matches those values for both normal and dark-mode dashboards.

---

## Features

- Reads shadcn-style CSS variables from a standard `globals.css` or similar file
- Supports both light and dark themes
- Generates:
  - `superset-theme-light.json`
  - `superset-theme-dark.json`
  - `superset-theme-light.yaml`
  - `superset-theme-dark.yaml`
- Auto-detects common CSS locations or accepts a custom path
- Supports environment overrides via `SHADCN_CSS_PATH`
- Allows custom brand metadata through `superset-themer.config.json`
- Includes sensible default Superset branding values

---

## Installation

### Option 1: Run without installing

```bash
npx superset-themer
```

This is the easiest way to use it in a project or CI pipeline.

### Option 2: Install locally

```bash
npm install --save-dev superset-themer
```

Then run:

```bash
npx superset-themer
```

---

## Quick start

From your project root, run:

```bash
npx superset-themer
```

The tool will look for a CSS file in common locations such as:

- `./globals.css`
- `./src/globals.css`
- `./src/app/globals.css`
- `./src/index.css`
- `./app/globals.css`

If it finds a matching file, it creates the Superset theme files in the current working directory.

---

## Custom CSS file path

You can pass a path explicitly:

```bash
npx superset-themer ./styles/globals.css
```

Or if you want to control the file path from environment variables:

```bash
SHADCN_CSS_PATH=./styles/globals.css npx superset-themer
```

This is useful when your app stores theme variables outside the default locations.

---

## Generated output

After running the tool, you will get files like:

```text
superset-theme-light.json
superset-theme-dark.json
superset-theme-light.yaml
superset-theme-dark.yaml
```

These files contain a Superset-compatible theme structure with values mapped from the shadcn token names.

### Example JSON structure

```json
{
  "theme_name": "Shadcn_Light_Preset",
  "json_data": {
    "token": {
      "colorPrimary": "#183a30",
      "colorLink": "#365d4e",
      "colorError": "#b84a45",
      "colorTextBase": "#1b2b25",
      "colorBgBase": "#f3f6f2",
      "colorBgContainer": "#ffffff",
      "borderRadius": 5,
      "brandAppName": "Meridian Analytics"
    },
    "algorithm": "default"
  },
  "uuid": "<generated-uuid>",
  "version": "1.0.0"
}
```

### Example YAML structure

```yaml
theme_name: Shadcn_Light_Preset
json_data:
  token:
    colorPrimary: '#183a30'
    colorLink: '#365d4e'
    colorError: '#b84a45'
    colorTextBase: '#1b2b25'
    colorBgBase: '#f3f6f2'
    colorBgContainer: '#ffffff'
    borderRadius: 5
    brandAppName: Meridian Analytics
  algorithm: default
uuid: <generated-uuid>
version: '1.0.0'
```

---

## Supported CSS variables

The converter looks for common shadcn theme variables such as:

- `--background`
- `--foreground`
- `--card`
- `--primary`
- `--destructive`
- `--border`
- `--radius`

It reads theme values from:

- `:root { ... }` for the light/default theme
- `.dark { ... }` for the dark theme

### Variable mapping behavior

The generator converts CSS token values into Superset-friendly token data, including:

- HSL CSS values into a Superset-compatible color format when needed
- `--radius` values into numeric radius values
- standard shadcn token names into Superset `token` fields like:
  - `colorPrimary`
  - `colorTextBase`
  - `colorBgBase`
  - `colorBgContainer`
  - `colorBorder`

---

## Custom branding and defaults

The package includes default branding metadata used by Superset theme files, including:

- `brandAppName`
- `brandLogoAlt`
- `brandLogoUrl`
- `brandLogoHref`
- `fontFamily`
- `fontFamilyCode`
- `transitionTiming`

You can override these defaults by creating a file named:

```bash
superset-themer.config.json
```

in the project root.

### Example override file

```json
{
  "brandAppName": "Acme Analytics",
  "brandLogoAlt": "Acme Analytics",
  "brandLogoHref": "/",
  "fontFamily": "Inter, sans-serif",
  "fontFamilyCode": "JetBrains Mono, monospace"
}
```

This file is merged with the default configuration so you only need to provide the values you want to change.

---

## Example workflow

### 1. Create your shadcn theme CSS

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --card: 0 0% 100%;
  --border: 214.3 31.8% 91.1%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.1% 59.9%;
  --card: 222.2 84% 4.9%;
  --border: 217.2 32.4% 17.1%;
  --radius: 0.5rem;
}
```

### 2. Run the converter

```bash
npx superset-themer ./styles/globals.css
```

### 3. Import the generated files in Superset

The package creates both JSON and YAML files that you can load into your Superset configuration or import into your theme management workflow.

---

## Notes about behavior

- The tool expects CSS variable blocks to be written in a standard shadcn/Tailwind style.
- If the file is not found, it throws a clear error and asks you to point it to the correct path.
- The generated values are meant to be practical defaults; some visual tuning may still be needed in Superset for brand polish or typography.
- The package uses a UUID per generated theme, which is useful when you want unique theme entries in Superset exports.

---

## Common troubleshooting

### The CSS file is not found

Try one of these:

```bash
npx superset-themer ./path/to/globals.css
```

or:

```bash
SHADCN_CSS_PATH=./path/to/globals.css npx superset-themer
```

### Values are missing

Confirm that your CSS contains expected variables such as `--primary`, `--background`, `--foreground`, and `--radius` in the correct blocks.

### Dark mode is not generated correctly

Make sure your CSS defines a `.dark` selector block using the same variable names as your `:root` theme.

---

## Example package usage in scripts

You can also use the package programmatically in Node.js:

```js
import { generateSupersetThemes } from 'superset-themer';

generateSupersetThemes('./styles/globals.css', './dist');
```

This will generate theme output files in the target directory.

---

## License

MIT

## Author

Ritesh Sangani

