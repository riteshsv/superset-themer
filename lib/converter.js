import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import crypto from 'crypto';

// Comprehensive path resolver sequence with existence validation
export function findCssFile(explicitPath) {
    // Priority 1: System environment variable configuration
    if (process.env.SHADCN_CSS_PATH) {
        const envPath = path.resolve(process.env.SHADCN_CSS_PATH);
        if (fs.existsSync(envPath)) return envPath;
        throw new Error(`File specified in SHADCN_CSS_PATH does not exist: ${envPath}`);
    }

    // Priority 2: Direct function invocation parameter override
    if (explicitPath) {
        const customPath = path.resolve(explicitPath);
        if (fs.existsSync(customPath)) return customPath;
        throw new Error(`The specified CSS file path does not exist: ${customPath}`);
    }

    // Priority 3: Scan predictable frontend configuration positions
    const predictableLocations = [
        './globals.css',
        './src/globals.css',
        './src/app/globals.css',
        './src/index.css',
        './app/globals.css'
    ];

    for (const location of predictableLocations) {
        const absolutePath = path.resolve(location);
        if (fs.existsSync(absolutePath)) {
            return absolutePath;
        }
    }

    throw new Error("Could not automatically locate your css configuration. Please set SHADCN_CSS_PATH environment variable or specify a direct directory path.");
}

function formatValue(key, rawValue) {
    const value = rawValue.trim();
    if (key === 'radius') {
        if (value.includes('rem')) return parseFloat(value) * 16;
        if (value.includes('px')) return parseFloat(value);
        return 5;
    }
    const tokens = value.split(/\s+/);
    if (tokens.length >= 3) {
        return `hsl(${tokens[0]}, ${tokens[1]}, ${tokens[2]})`;
    }
    return value;
}

function extractVariables(cssContent, selectorRegex) {
    const matchBlock = cssContent.match(selectorRegex);
    if (!matchBlock) return {};
    const innerContent = matchBlock[1];
    const variableRegex = /--([\w-]+):\s*([^;\n]+)/g;
    const variables = {};
    let match;
    while ((match = variableRegex.exec(innerContent)) !== null) {
        const [_, key, rawValue] = match;
        variables[key] = formatValue(key, rawValue);
    }
    return variables;
}

export function generateSupersetThemes(customCssPath, outputDir = '.') {
    const targetCssPath = findCssFile(customCssPath);
    console.log(`📦 Sourcing Tailwind Variables from: ${targetCssPath}`);

    const cssContent = fs.readFileSync(targetCssPath, 'utf-8');
    const lightVars = extractVariables(cssContent, /:root\s*\{([^}]+)\}/);
    const darkVars = extractVariables(cssContent, /\.dark\s*\{([^}]+)\}/);

    let sharedBaseDefaults = {
        brandAppName: "Meridian Analytics",
        brandLogoAlt: "Meridian Analytics",
        brandLogoUrl: "/static/assets/images/superset-logo-horiz.png",
        brandLogoMargin: "18px 0",
        brandLogoHref: "/",
        brandLogoHeight: "24px",
        brandSpinnerUrl: null,
        brandSpinnerSvg: null,
        fontUrls: [],
        fontFamily: "'Avenir Next', 'Helvetica Neue', sans-serif",
        fontFamilyCode: "'IBM Plex Mono', 'Courier New', monospace",
        transitionTiming: 0.3,
        brandIconMaxWidth: 37,
        fontSizeXS: "8",
        fontSizeXXL: "28",
        fontWeightNormal: "400",
        fontWeightLight: "300",
        fontWeightStrong: "500",
        fontWeightBold: "700",
        fontSize: 14
    };

    // 2. Scan project workspace for a dynamic runtime JSON configuration file override
    const userConfigPath = path.resolve(process.cwd(), 'superset-themer.config.json');
    if (fs.existsSync(userConfigPath)) {
        try {
            const userConfig = JSON.parse(fs.readFileSync(userConfigPath, 'utf-8'));
            console.log(`⚙️ Loaded custom branding configuration overrides from: ${userConfigPath}`);
            // Merge user preferences cleanly on top of baseline defaults
            sharedBaseDefaults = { ...sharedBaseDefaults, ...userConfig };
        } catch (e) {
            console.warn(`⚠️ Failed to parse superset-themer.config.json, using baseline defaults instead.`);
        }
    } else {
        const localProjectJsonPath = path.resolve(process.cwd(), 'package.json');
        let dynamicAppName = "";

        if (fs.existsSync(localProjectJsonPath)) {
            const pkg = JSON.parse(fs.readFileSync(localProjectJsonPath, 'utf-8'));
            if (pkg.name) {
                // Converts "my-cool-dashboard-app" into "My Cool Dashboard App"

                dynamicAppName = pkg.name
                    .split(/[-_]/)
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                let dynamicConfig = {
                    brandAppName: dynamicAppName,
                }
                // Merge user preferences cleanly on top of baseline defaults
                sharedBaseDefaults = { ...sharedBaseDefaults, ...dynamicConfig };
            }
        }
    }

    const lightJsonData = {
        token: {
            ...sharedBaseDefaults,
            colorPrimary: lightVars['primary'] || '#183a30',
            colorLink: lightVars['primary'] || '#365d4e',
            colorError: lightVars['destructive'] || '#b84a45',
            colorWarning: '#c77751',
            colorSuccess: '#83a97d',
            colorInfo: lightVars['primary'] || '#365d4e',
            colorTextBase: lightVars['foreground'] || '#1b2b25',
            colorBgBase: lightVars['background'] || '#f3f6f2',
            colorBgContainer: lightVars['card'] || '#ffffff',
            colorBorder: lightVars['border'] || '#e2e8e2',
            borderRadius: lightVars['radius'] || 5,
            colorEditorSelection: '#fff5cf'
        },
        algorithm: "default"
    };

    const lightYamlStructure = {
        theme_name: "Shadcn_Light_Preset",
        json_data: lightJsonData,
        uuid: crypto.randomUUID(),
        version: "1.0.0"
    };

    const darkJsonData = {
        token: {
            ...sharedBaseDefaults,
            brandAppName: "Meridian Analytics Dark",
            colorPrimary: darkVars['primary'] || '#fafafa',
            colorLink: darkVars['primary'] || '#a1a1aa',
            colorError: darkVars['destructive'] || '#ef4444',
            colorWarning: '#c77751',
            colorSuccess: '#83a97d',
            colorInfo: darkVars['primary'] || '#365d4e',
            colorTextBase: darkVars['foreground'] || '#fafafa',
            colorBgBase: darkVars['background'] || '#09090b',
            colorBgContainer: darkVars['card'] || '#09090b',
            colorBorder: darkVars['border'] || '#27272a',
            borderRadius: darkVars['radius'] || lightVars['radius'] || 5,
            colorEditorSelection: '#27272a'
        },
        algorithm: "dark"
    };

    const darkYamlStructure = {
        theme_name: "Shadcn_Dark_Preset",
        json_data: darkJsonData,
        uuid: crypto.randomUUID(),
        version: "1.0.0"
    };

    const resolveOut = (filename) => path.join(path.resolve(outputDir), filename);

    fs.writeFileSync(resolveOut('superset-theme-light.json'), JSON.stringify(lightYamlStructure, null, 2));
    fs.writeFileSync(resolveOut('superset-theme-dark.json'), JSON.stringify(darkYamlStructure, null, 2));
    fs.writeFileSync(resolveOut('superset-theme-light.yaml'), YAML.stringify(lightYamlStructure));
    fs.writeFileSync(resolveOut('superset-theme-dark.yaml'), YAML.stringify(darkYamlStructure));

    return { lightYamlStructure, darkYamlStructure };
}
