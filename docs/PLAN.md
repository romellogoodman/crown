# PrinceXML Book Framework

A modern development framework for creating print-quality PDFs with hot reload and developer-friendly workflows.

## Vision

Create a framework that brings the modern web development experience (hot reload, component-based architecture, data-driven content) to PDF book creation using PrinceXML.

## Core Concept

```bash
# Create a new book project
npx create-prince-book my-book

# Start development mode
cd my-book
npm run dev

# Watch mode rebuilds PDF on save
# Dev server shows PDF in iframe and auto-reloads
```

## Framework Architecture

### Project Structure

```
my-book/
├── src/
│   ├── content/              # Content in Markdown
│   │   ├── 00-title.md
│   │   ├── 01-intro.md
│   │   ├── 02-chapter.md
│   │   └── 03-conclusion.md
│   │
│   ├── templates/            # HTML templates
│   │   ├── layout.html       # Main layout template
│   │   └── title.html        # Title page template
│   │
│   └── styles.css            # Main stylesheet
│
├── dist/                     # Generated files
│   ├── book.html            # Compiled HTML
│   └── book.pdf             # Generated PDF
│
├── prince.config.js         # Framework configuration
└── package.json
```

### Configuration File

```javascript
// prince.config.js
export default {
  // Input sources
  input: {
    content: "src/content/**/*.md",
    template: "src/templates/layout.html",
    styles: "src/styles.css",
  },

  // Output configuration
  output: {
    html: "dist/book.html",
    pdf: "dist/book.pdf",
  },

  // Book metadata
  metadata: {
    title: "404: Poems Not Found",
    author: "Lost & Found Press",
  },

  // Page configuration
  page: {
    size: "5.5in 8.5in",
    margins: {
      top: "0.75in",
      bottom: "0.75in",
      inside: "0.75in",
      outside: "0.5in",
    },
  },

  // Prince options
  prince: {
    javascript: true,
    verbose: false,
  },

  // Dev server configuration
  devServer: {
    port: 3000,
    open: true,
  },
};
```

### Content in Markdown

```markdown
---
title: Error 404
id: poem-1
---

# Error 404

The page you seek
Is not here, friend.
Perhaps it never was.

In digital halls
Where data flows like water,
Your path has led
To absence.
```

### Template System

Templates use Handlebars with access to content and metadata:

```html
<!-- src/templates/layout.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>{{metadata.title}}</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    {{> title}}

    {{#each chapters}}
    <section class="chapter">
      <h1 id="{{id}}">{{title}}</h1>
      {{{content}}}
    </section>
    {{/each}}

    <script src="scripts.js"></script>
  </body>
</html>
```

## CLI Commands

### Project Creation

```bash
# Create new book project
npx create-prince-book my-book

# What it creates:
# - src/ directory with content/, templates/, and styles.css
# - prince.config.js with metadata
# - package.json with scripts
# - Basic .gitignore
```

### Development

```bash
# Start development mode
npm run dev

# What happens:
# 1. Compiles markdown + templates → HTML
# 2. Generates PDF with Prince
# 3. Starts Vite dev server
# 4. Opens browser showing PDF in iframe
# 5. Watches for file changes
# 6. On change: rebuild → reload iframe
```

### Build

```bash
# Production build
npm run build

# Build with options
npm run build -- --verbose
npm run build -- --output=dist/final.pdf

# Watch mode (no dev server)
npm run watch
```

### Preview

```bash
# Preview HTML in browser
npm run preview:html

# Open generated PDF
npm run preview:pdf
```

## Development Workflow

### Watch Mode Implementation

The framework watches these file types:

1. **Content files** (`.md`, `.yml`) - Triggers full rebuild
2. **Templates** (`.html`, `.hbs`) - Recompiles templates → PDF
3. **Styles** (`.css`, `.scss`) - Rebuilds CSS → PDF
4. **Config** (`prince.config.js`) - Restarts dev server

**Build Process:**

```
Content (.md) + Metadata (.yml) + Template (.html)
  ↓
Compile with Handlebars
  ↓
book.html
  ↓
Prince (with styles.css)
  ↓
book.pdf
  ↓
Reload iframe in browser
```

### PDF Auto-Reload via Dev Server

The dev server serves a simple webpage that:

1. Loads the PDF in an `<iframe>`
2. Watches for file changes via WebSocket
3. Reloads the iframe when PDF updates

```html
<!-- Dev server page -->
<!DOCTYPE html>
<html>
  <head>
    <title>Book Preview</title>
    <style>
      body,
      html {
        margin: 0;
        padding: 0;
        height: 100%;
        overflow: hidden;
      }
      iframe {
        width: 100%;
        height: 100%;
        border: none;
      }
    </style>
  </head>
  <body>
    <iframe src="/book.pdf"></iframe>
    <script>
      // Vite's HMR handles reload
      if (import.meta.hot) {
        import.meta.hot.on('pdf-updated', () => {
          document.querySelector('iframe').src = '/book.pdf?t=' + Date.now();
        });
      }
    </script>
  </body>
</html>
```

**Advantages:**

- Works on all platforms (no special PDF viewer needed)
- Instant reload in browser
- Can add dev tools/overlays around iframe
- Preview on mobile devices via network URL

## Component System

### Reusable Templates

```html
<!-- src/templates/title.html -->
<section class="title-page">
  <h1 class="book-title">{{metadata.title}}</h1>
  <p class="author">{{metadata.author}}</p>
</section>
```

### Template Usage

```html
<!-- src/templates/layout.html -->
{{> title}}

{{#each chapters}}
<section class="chapter">
  <h1 id="{{id}}">{{title}}</h1>
  {{{content}}}
</section>
{{/each}}
```

Copyright, TOC, and other front/back matter can be added as markdown files in `src/content/`.

## Data-Driven Content

### CSV/JSON to Tables

```markdown
# Sales Data

{{table source="./data.csv" caption="Q4 Sales"}}
```

### External Data Sources

```javascript
// prince.config.js
export default {
  data: {
    sales: "./data/sales.csv",
    authors: "https://api.example.com/authors",
  },
};
```

Access in templates:

```html
<table>
  {{#each data.sales}}
  <tr>
    <td>{{month}}</td>
    <td>{{amount}}</td>
  </tr>
  {{/each}}
</table>
```

## Technical Stack

**Build Tool:** Vite

- Fast dev server with HMR
- Built-in file watching
- WebSocket for live reload
- ES modules support

**Template Engine:** Handlebars

- Simple, logic-less templates
- Partials for components
- Helpers for custom functions
- Well-documented

**Styles:** CSS + SCSS

- SCSS for variables and nesting
- PostCSS for vendor prefixing
- Prince-specific properties supported

**Language:** TypeScript

- Better developer experience
- Type safety for config
- IDE autocomplete

**License:** MIT

## Implementation Roadmap

### Phase 1: Core Framework (MVP)

- [x] Define project structure
- [x] Design configuration API
- [ ] Build markdown → HTML compilation
- [ ] Integrate Handlebars templating
- [ ] Set up Vite dev server
- [ ] Implement PDF generation with Prince
- [ ] Create iframe-based preview
- [ ] Add file watching and reload
- [ ] Build `create-prince-book` CLI

### Phase 2: Developer Experience

- [ ] Fast incremental builds
- [ ] Better error messages
- [ ] Source maps for debugging
- [ ] CLI improvements (better output, progress)
- [ ] Component system documentation
- [ ] Example projects

### Phase 3: Advanced Features (Future)

- [ ] Plugin system
- [ ] Multi-pass layout
- [ ] Data-driven content (CSV/JSON)
- [ ] Multi-format export (EPUB)
- [ ] Custom Prince functions
- [ ] Advanced typography features

### Phase 4: Ecosystem (Future)

- [ ] VSCode extension
- [ ] Plugin marketplace
- [ ] Cloud building service
- [ ] CI/CD integration examples
- [ ] Tutorial series

## Learning from Bindery

### What We're Taking

1. **The pageInfo context object**

   - Expose page state to templates
   - Make it easy to create running headers/footers

2. **Split detection**

   - Add classes when elements break across pages
   - Allow styling of split content

3. **JavaScript-first API for complex logic**

   - Running headers as functions, not CSS magic
   - Page references with custom logic

4. **The DX philosophy**
   - Fast feedback loops
   - Instant preview
   - Simple, intuitive API

### What We're Keeping from Prince

1. **Print-quality PDF output**

   - CMYK support
   - Proper font embedding
   - PDF/X standards

2. **Advanced typography**

   - OpenType features
   - Custom hyphenation
   - Professional typesetting

3. **Standards-based CSS**

   - CSS Paged Media specs
   - Predictable, documented behavior

4. **Command-line tool**
   - Great for automation
   - CI/CD friendly
   - No browser dependencies

## Example: Building the 404 Poems Book

With this framework, the current project would become:

```
404-poems/
├── src/
│   ├── content/
│   │   ├── 00-title.md
│   │   ├── 01-error-404.md
│   │   ├── 02-broken-link.md
│   │   └── ... (8 more)
│   ├── templates/
│   │   ├── layout.html
│   │   └── title.html
│   └── styles.css
└── prince.config.js  # Contains all metadata
```

Commands:

```bash
npm run dev        # Live development with iframe preview
npm run build      # Generate final PDF
```

The framework handles:

- ✅ Automatic TOC generation
- ✅ PDF metadata
- ✅ Page numbering
- ✅ Running headers
- ✅ Hot reload via iframe
- ✅ Statistics
- ✅ ES5 compatibility for Prince

The author just writes Markdown and configures YAML.

## Next Steps

1. **Build MVP**

   - Start with simplest working version
   - Markdown → HTML → PDF pipeline
   - Basic dev server with iframe reload

2. **Test with 404 poems**

   - Convert current project to use framework
   - Validate that it actually improves workflow
   - Find pain points

3. **Iterate**

   - Add features based on real usage
   - Keep it simple and focused
   - Don't over-engineer

4. **Document**
   - Clear getting started guide
   - API reference
   - Migration guide from raw Prince

---

**Questions? Feedback? Let's iterate!**
