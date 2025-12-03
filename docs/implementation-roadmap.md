# Crown Implementation Plan

## Project Overview

Crown is a modern development framework for creating print-quality PDFs using PrinceXML. It brings modern web development workflows (hot reload, component-based architecture, data-driven content) to PDF book creation.

## Architecture Decisions

### Core Choices
- **Language**: TypeScript (for type safety and better DX)
- **Module System**: ES Modules (modern standard)
- **Package Manager**: npm
- **Structure**: Single package (crown) containing both framework and CLI
- **Build Tool**: tsup for building the framework, Vite for user projects' dev server

### Dependencies
- **Templates**: Handlebars (logic-less, well-documented)
- **Markdown**: marked (fast, extensible)
- **Frontmatter**: gray-matter (YAML frontmatter parsing)
- **CLI**: commander (feature-rich CLI framework)
- **File Watching**: chokidar (cross-platform file watcher)
- **Dev Server**: Vite (fast HMR, WebSocket support)
- **Styles**: SCSS support via sass
- **Config**: cosmiconfig (flexible config loading)

## Project Structure

```
crown/
├── src/
│   ├── core/
│   │   ├── config.ts           # Config loading & validation
│   │   ├── markdown.ts         # Markdown compilation
│   │   ├── template.ts         # Handlebars rendering
│   │   ├── builder.ts          # Build orchestration
│   │   ├── prince.ts           # Prince CLI wrapper
│   │   ├── data.ts             # Data loading (CSV/JSON)
│   │   └── utils.ts            # Shared utilities
│   │
│   ├── dev/
│   │   ├── server.ts           # Vite dev server setup
│   │   ├── watcher.ts          # File watching logic
│   │   ├── plugin.ts           # Vite plugin for Crown
│   │   └── preview.html        # PDF iframe preview template
│   │
│   ├── cli/
│   │   ├── index.ts            # CLI entry point
│   │   ├── commands/
│   │   │   ├── create.ts       # create-crown functionality
│   │   │   ├── dev.ts          # Development server
│   │   │   ├── build.ts        # Production build
│   │   │   ├── watch.ts        # Watch mode (no server)
│   │   │   └── preview.ts      # Preview HTML/PDF
│   │   └── logger.ts           # Pretty console output
│   │
│   ├── types/
│   │   ├── config.ts           # Config type definitions
│   │   ├── content.ts          # Content type definitions
│   │   └── index.ts            # Public API types
│   │
│   └── index.ts                # Main exports
│
├── templates/
│   └── default/                # Default project template
│       ├── src/
│       │   ├── content/
│       │   │   ├── 00-title.md
│       │   │   ├── 01-intro.md
│       │   │   └── 02-chapter-one.md
│       │   ├── templates/
│       │   │   ├── layout.html
│       │   │   ├── partials/
│       │   │   │   ├── title.html
│       │   │   │   ├── toc.html
│       │   │   │   └── chapter.html
│       │   │   └── helpers.js
│       │   └── styles.css
│       ├── crown.config.js
│       ├── package.json
│       ├── .gitignore
│       └── README.md
│
├── dist/                       # Built framework code
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── README.md
```

## Implementation Phases

### Phase 1: Core Framework Foundation
1. **Project Setup**
   - Initialize TypeScript configuration
   - Set up build pipeline (tsup)
   - Configure package.json with proper exports
   - Set up ESM module structure

2. **Config System**
   - Implement config loader with cosmiconfig
   - Define config schema with TypeScript types
   - Add config validation
   - Support crown.config.js, .ts, .json

3. **Markdown Compiler**
   - Integrate marked for markdown parsing
   - Add gray-matter for frontmatter
   - Implement custom marked extensions (if needed)
   - Support metadata extraction

4. **Template System**
   - Set up Handlebars renderer
   - Implement partial loading system
   - Add custom helpers (TOC generation, page refs, etc.)
   - Support template inheritance

5. **Build Pipeline**
   - Orchestrate: content → templates → HTML
   - Implement content ordering/sorting
   - Generate combined HTML output
   - Add build statistics and logging

### Phase 2: Prince Integration
1. **Prince Wrapper**
   - Create spawn wrapper for prince CLI
   - Parse prince output/errors
   - Support all common prince options
   - Add progress reporting

2. **PDF Generation**
   - Integrate Prince into build pipeline
   - Pass HTML to Prince
   - Handle Prince options from config
   - Generate PDF metadata

3. **Error Handling**
   - Capture Prince errors and warnings
   - Pretty-print error messages
   - Source mapping for debugging
   - Helpful error suggestions

### Phase 3: Development Server
1. **Vite Integration**
   - Create Vite plugin for Crown
   - Set up dev server configuration
   - Serve compiled HTML and PDF
   - Add iframe preview page

2. **File Watching**
   - Watch content, templates, styles, config
   - Trigger appropriate rebuilds
   - Debounce rapid changes
   - Report build status

3. **Hot Module Replacement**
   - Implement WebSocket communication
   - Send rebuild notifications
   - Auto-reload iframe on PDF update
   - Show build errors in browser

4. **Dev Experience**
   - Add loading states
   - Show build progress
   - Display warnings/errors overlay
   - Add keyboard shortcuts (refresh, etc.)

### Phase 4: CLI Tool
1. **CLI Framework**
   - Set up commander
   - Define command structure
   - Add global options (--verbose, --config)
   - Implement help system

2. **Create Command**
   - Project scaffolding logic
   - Template copying
   - Package.json generation
   - Post-create instructions

3. **Dev Command**
   - Start dev server
   - Open browser automatically
   - Watch and rebuild
   - Handle shutdown gracefully

4. **Build Command**
   - Production build
   - Optimization options
   - Output customization
   - Success reporting

5. **Additional Commands**
   - watch: Build on file changes (no server)
   - preview:html: Open HTML in browser
   - preview:pdf: Open PDF in system viewer
   - validate: Check config and content

### Phase 5: Advanced Features
1. **Data Integration**
   - Load CSV data with Papa Parse
   - Load JSON data
   - Load YAML data
   - Make data available in templates

2. **Custom Helpers**
   - TOC generation helper
   - Page counter/references
   - Conditional content
   - Date formatting
   - String utilities

3. **Content Processing**
   - Code syntax highlighting
   - Image optimization
   - Table processing
   - Math equations (optional)

4. **Style System**
   - SCSS compilation
   - PostCSS processing
   - CSS minification
   - Prince-specific CSS validation

### Phase 6: Testing & Documentation
1. **Testing**
   - Unit tests (vitest)
   - Integration tests
   - CLI tests
   - Template tests

2. **Documentation**
   - README with quick start
   - API documentation
   - Configuration reference
   - Template guide
   - Migration guide from raw Prince

3. **Examples**
   - Basic book example
   - Poetry book (404 poems)
   - Report template
   - Invoice template
   - Multi-column layout

### Phase 7: Advanced DX Features (Future)
1. **Prince for Books Support**
   - Support -prince-prefer properties
   - Spread balancing configuration
   - Advanced line breaking
   - Fractional widows

2. **Plugin System**
   - Plugin API design
   - Plugin loading mechanism
   - Example plugins
   - Plugin documentation

3. **Multi-pass Layout**
   - JavaScript execution support
   - Prince.registerPostLayoutFunc
   - Box tracking
   - Dynamic index generation

4. **Cloud/CI Features**
   - GitHub Actions example
   - Docker support
   - Environment variable config
   - Headless mode

## API Design

### Config API

```typescript
// crown.config.ts
import { defineConfig } from 'crown';

export default defineConfig({
  input: {
    content: 'src/content/**/*.md',
    template: 'src/templates/layout.html',
    styles: 'src/styles.css',
  },
  output: {
    html: 'dist/book.html',
    pdf: 'dist/book.pdf',
  },
  metadata: {
    title: 'My Book',
    author: 'Author Name',
    subject: 'Book subject',
    keywords: ['keyword1', 'keyword2'],
  },
  page: {
    size: '5.5in 8.5in',
    margins: {
      top: '0.75in',
      bottom: '0.75in',
      inside: '0.75in',
      outside: '0.5in',
    },
  },
  prince: {
    javascript: true,
    verbose: false,
    options: ['--pdf-profile=PDF/X-3:2002'],
  },
  devServer: {
    port: 3000,
    open: true,
    host: 'localhost',
  },
  data: {
    sales: './data/sales.csv',
    authors: './data/authors.json',
  },
  helpers: './src/templates/helpers.js',
});
```

### CLI API

```bash
# Create new project
crown create my-book
crown create my-book --template poetry

# Development
crown dev
crown dev --port 3001
crown dev --no-open

# Build
crown build
crown build --output dist/final.pdf
crown build --verbose

# Watch (no server)
crown watch

# Preview
crown preview:html
crown preview:pdf

# Validate
crown validate
```

### Programmatic API

```typescript
import { Crown } from 'crown';

const crown = new Crown({
  // config options
});

// Build once
await crown.build();

// Watch mode
const watcher = await crown.watch({
  onChange: (type, path) => {
    console.log(`${type} changed: ${path}`);
  }
});

// Clean up
await watcher.close();
```

## Content Format

### Markdown with Frontmatter

```markdown
---
title: Chapter One
subtitle: The Beginning
author: Author Name
id: chapter-1
order: 1
tags: [introduction, important]
---

# Chapter One

Content goes here...
```

### Template Format

```html
<!-- layout.html -->
<!DOCTYPE html>
<html lang="{{lang}}">
<head>
  <meta charset="UTF-8">
  <title>{{metadata.title}}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  {{> title}}

  {{> toc chapters=chapters}}

  {{#each chapters}}
    {{> chapter}}
  {{/each}}

  <script src="scripts.js"></script>
</body>
</html>
```

## Key Technical Considerations

### 1. File Watching Strategy
- Watch content/, templates/, styles/, and config
- Debounce rapid changes (300ms)
- Differentiate between content types for smart rebuilds
- Full rebuild on config change

### 2. Build Performance
- Parallel processing where possible
- Incremental compilation for dev mode
- Cache parsed templates
- Cache markdown compilation
- Only regenerate PDF if HTML changed

### 3. Error Recovery
- Continue watching after build errors
- Show errors in browser overlay
- Don't crash on Prince errors
- Provide actionable error messages

### 4. Cross-Platform Support
- Use path.posix for consistency
- Test on Windows, macOS, Linux
- Handle different line endings
- Support different Prince install locations

### 5. Module Resolution
- Support both relative and absolute imports
- Handle partials from node_modules
- Support custom partial directories
- Resolve data files relative to config

## Success Criteria

### Phase 1-4 Complete (MVP)
- ✅ Can create new project with `crown create`
- ✅ Can run `crown dev` and see PDF in browser
- ✅ Can edit markdown and see instant updates
- ✅ Can edit templates/styles and see updates
- ✅ Can run `crown build` for production PDF
- ✅ TypeScript types work for config
- ✅ Error messages are helpful

### Phase 5-6 Complete (Production Ready)
- ✅ Data-driven content works (CSV/JSON)
- ✅ Custom Handlebars helpers
- ✅ SCSS compilation
- ✅ Full test coverage
- ✅ Complete documentation
- ✅ Multiple example projects

### Phase 7 Complete (Advanced)
- ✅ Plugin system working
- ✅ Prince for Books features
- ✅ Multi-pass layout support
- ✅ CI/CD examples

## Timeline Approach

Since there's no deadline, we'll focus on:
1. **Quality over speed** - Write clean, maintainable code
2. **Testing as we go** - Add tests for each component
3. **Documentation inline** - Document decisions and usage
4. **Iterative refinement** - Build, test, improve, repeat

## Next Steps

1. Set up TypeScript and build configuration
2. Implement config loading system
3. Build markdown compiler
4. Add template renderer
5. Create basic build pipeline
6. Test end-to-end: markdown → HTML → PDF
7. Add dev server and HMR
8. Implement CLI commands
9. Create default template
10. Continue through remaining phases...

Each component will be built with extensibility in mind, making future enhancements easier.
