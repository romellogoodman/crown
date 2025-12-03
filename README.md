# Crown

**Create books using HTML, CSS, and PrinceXML**

Crown is a modern development framework that brings the best of web development to PDF book creation. Write your content in Markdown, style it with CSS, and generate print-quality PDFs with hot reload and instant preview.

## Features

- 📝 **Markdown Content** - Write in simple, familiar Markdown with frontmatter
- 🎨 **Template System** - Use Handlebars templates with partials and helpers
- 🔥 **Hot Reload** - See changes instantly in your browser
- 📄 **PrinceXML Integration** - Generate professional, print-ready PDFs
- 🎯 **Type-Safe Config** - Full TypeScript support with intelligent autocomplete
- 📊 **Data-Driven** - Load data from CSV, JSON, or YAML files
- ⚡ **Fast Builds** - Powered by Vite for lightning-fast development

## Quick Start

```bash
# Create a new book project
npx crown create my-book

# Start development
cd my-book
npm install
npm run dev
```

Your browser will open with a live preview of your PDF. Edit any file and watch it update instantly!

## Installation

```bash
# As a project dependency
npm install crown

# Or use directly with npx
npx crown create my-book
```

**Requirements:**

- Node.js 18 or higher
- PrinceXML installed and in your PATH ([download here](https://www.princexml.com/download/))

## Project Structure

```
my-book/
├── src/
│   ├── content/          # Markdown content files
│   │   ├── 00-title.md
│   │   ├── 01-intro.md
│   │   └── 02-chapter-one.md
│   ├── templates/        # Handlebars templates
│   │   ├── layout.html
│   │   └── partials/
│   │       ├── title.html
│   │       └── chapter.html
│   └── styles.css        # Main stylesheet
├── crown.config.js       # Configuration
└── dist/                 # Generated files
    ├── book.html
    └── book.pdf
```

## Configuration

Create a `crown.config.js` file in your project root:

```javascript
import { defineConfig } from "crown";

export default defineConfig({
  input: {
    content: "src/content/**/*.md",
    template: "src/templates/layout.html",
    styles: "src/styles.css",
  },
  output: {
    html: "dist/book.html",
    pdf: "dist/book.pdf",
  },
  metadata: {
    title: "My Book",
    author: "Your Name",
    subject: "A great book",
    keywords: ["book", "crown"],
  },
  page: {
    size: "5.5in 8.5in",
    margins: {
      top: "0.75in",
      bottom: "0.75in",
      inside: "0.75in",
      outside: "0.5in",
    },
  },
});
```

## Writing Content

Content files are written in Markdown with YAML frontmatter:

```markdown
---
title: Chapter One
subtitle: The Beginning
id: chapter-1
order: 1
---

# Chapter One

Your content here...
```

The `order` field determines the sequence of content in your book.

## Templates

Crown uses Handlebars for templating. Access your content and metadata in templates:

```html
<!DOCTYPE html>
<html lang="{{metadata.lang}}">
  <head>
    <title>{{metadata.title}}</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    {{#each chapters}}
    <section class="chapter" id="{{frontmatter.id}}">
      <h1>{{frontmatter.title}}</h1>
      {{{html}}}
    </section>
    {{/each}}
  </body>
</html>
```

### Built-in Helpers

- `{{markdown text}}` - Render inline markdown
- `{{json data}}` - Pretty-print JSON
- `{{formatDate date}}` - Format dates
- `{{eq a b}}` - Equality check
- `{{gt a b}}`, `{{lt a b}}` - Comparisons
- `{{length array}}` - Array length
- `{{join array separator}}` - Join array elements

## CSS for Print

Style your books with CSS, including Prince-specific properties:

```css
@page {
  size: 5.5in 8.5in;
  margin: 0.75in;
}

@page :left {
  @bottom-left {
    content: counter(page);
  }
}

@page :right {
  @bottom-right {
    content: counter(page);
  }
}

h1 {
  break-before: recto; /* Start chapters on right page */
  break-after: avoid; /* Keep with following content */
}
```

## CLI Commands

```bash
# Development
crown dev                 # Start dev server
crown dev --port 3001     # Custom port
crown dev --no-open       # Don't open browser

# Building
crown build               # Build production PDF
crown build --output path/to/output.pdf
crown build --verbose     # Show detailed output

# Utilities
crown watch               # Watch and rebuild (no server)
crown preview:html        # Open HTML in browser
crown preview:pdf         # Open PDF in viewer
```

## Data-Driven Content

Load external data into your templates:

```javascript
// crown.config.js
export default defineConfig({
  // ...
  data: {
    sales: "./data/sales.csv",
    authors: "./data/authors.json",
    stats: "./data/stats.yaml",
  },
});
```

Access in templates:

```handlebars
<table>
  {{#each data.sales}}
    <tr>
      <td>{{month}}</td>
      <td>{{amount}}</td>
    </tr>
  {{/each}}
</table>
```

## Custom Helpers

Add custom Handlebars helpers:

```javascript
// src/templates/helpers.js
export default {
  uppercase(str) {
    return str.toUpperCase();
  },
  formatPrice(amount) {
    return `$${amount.toFixed(2)}`;
  },
};
```

Reference in config:

```javascript
export default defineConfig({
  // ...
  helpers: "src/templates/helpers.js",
});
```

## Examples

- **Basic Book** - Simple chapter-based book
- **Poetry Collection** - Poems with custom formatting
- **Technical Manual** - Code examples and diagrams
- **Invoice Template** - Business document generation

## Why Crown?

### Before Crown

```bash
# Edit markdown
# Manually convert to HTML
# Copy HTML to template
# Run prince command
# Open PDF to check
# Repeat for every change 😰
```

### With Crown

```bash
crown dev
# Edit any file → instant preview ✨
```

## Inspiration

Crown was inspired by modern web development tools and the need for a better PDF creation workflow. It combines:

- The simplicity of Markdown
- The power of PrinceXML
- The speed of Vite
- The familiarity of web technologies

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Links

- [PrinceXML Documentation](https://www.princexml.com/doc/)
- [Markdown Guide](https://www.markdownguide.org/)
- [Handlebars Documentation](https://handlebarsjs.com/)

---

Made with 👑 by [Romello Goodman](https://www.romellogoodman.com/).
