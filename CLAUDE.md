# Crown Development Context

Crown is a modern framework for creating print-quality PDFs using PrinceXML. It brings hot reload and modern web dev workflows to book creation.

**Tagline:** Create books using HTML, CSS, and PrinceXML

## Project Structure (WHAT)

```
crown/
├── src/
│   ├── core/           # Core framework: config, markdown, templates, building
│   ├── dev/            # Vite dev server, file watching, HMR
│   ├── cli/            # Commander-based CLI with subcommands
│   └── types/          # TypeScript type definitions
├── templates/default/  # Scaffolding template for new projects
└── docs/               # Detailed documentation
```

**Key files:**
- `src/core/builder.ts` - Build orchestration (markdown → HTML → PDF pipeline)
- `src/core/config.ts` - Config loading with cosmiconfig
- `src/dev/plugin.ts` - Vite plugin for dev server
- `src/cli/index.ts` - CLI entry point

## Architecture (WHY)

**Tech Stack:**
- TypeScript (ES2022) + ESM modules
- tsdown (Rolldown) for building (replaces deprecated tsup)
- Handlebars for templating (logic-less, document-friendly)
- marked + gray-matter for Markdown + frontmatter
- Vite for dev server (fast HMR, WebSocket)
- chokidar for file watching
- commander for CLI

**Design Decisions:**
- ESM-only: Modern, better tree-shaking
- tsdown over tsup: tsup unmaintained, tsdown is successor on Rolldown
- Handlebars over alternatives: Logic-less templates work well for books
- Vite dev server: Serves PDF in iframe, auto-reloads via WebSocket
- Content ordering via frontmatter `order` field, not filenames

**Build Pipeline:**
1. Compile Markdown → HTML (marked + gray-matter)
2. Load data sources (CSV/JSON/YAML via Papa/js-yaml)
3. Render Handlebars template with context
4. Write HTML + copy assets
5. Run PrinceXML to generate PDF

## Working on Crown (HOW)

### Building
```bash
npm run build        # Build with tsdown
npm run dev          # Watch mode
npm run type-check   # Validate TypeScript
```

### Testing
Manual testing pattern:
```bash
cd /tmp && rm -rf test-crown-book && mkdir test-crown-book
cd test-crown-book
cp -r /path/to/crown/templates/default/* .
npm install /path/to/crown
npx crown build
```

Expected: Generates HTML + PDF (PDF requires PrinceXML installed)

### Adding Features

**New CLI command:**
1. Create `src/cli/commands/your-command.ts`
2. Register in `src/cli/index.ts`
3. Update README

**New config option:**
1. Update types in `src/types/config.ts`
2. Add defaults in `src/core/config.ts`
3. Use in relevant modules

**New Handlebars helper:**
Register in `src/core/template.ts`:
```typescript
this.handlebars.registerHelper('name', (arg) => result);
```

### Module Imports
Use `.js` extensions for internal imports (ESM requirement):
```typescript
import { something } from './other.js';
```

## Key Constraints

**Requirements:**
- Node.js 18+
- PrinceXML in PATH (for PDF generation)
- ESM-only (no CommonJS)

**File watching:** Debounced 300ms, watches content/templates/styles/config

## Documentation

See detailed docs in `docs/`:
- `architecture.md` - Detailed technical decisions
- `development.md` - Development workflows and patterns
- `project-vision.md` - Original project plan and roadmap
- `princexml-guide.md` - PrinceXML reference

## Contact

Author: Romello Goodman (https://www.romellogoodman.com/)
