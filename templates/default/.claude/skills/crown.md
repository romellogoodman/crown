# Crown Book Framework Skill

Create print-quality PDFs using HTML, CSS, and PrinceXML with modern web development workflows.

## Prerequisites
- Node.js 18+
- PrinceXML installed and in PATH (for PDF generation)
- Crown framework (`npm install crown-framework` or local path)

## Quick Start

### 1. Initialize a New Crown Book
```bash
# Create project directory
mkdir my-book && cd my-book

# Copy Crown template
npx crown init

# Or manually set up:
mkdir -p src/{content,templates,styles,data}
npm init -y
npm install crown-framework
```

### 2. Project Structure
```
my-book/
├── crown.config.js       # Configuration
├── src/
│   ├── content/         # Markdown chapters
│   │   ├── 00-intro.md
│   │   └── 01-chapter.md
│   ├── templates/       # Handlebars templates
│   │   └── main.hbs
│   ├── styles/          # CSS for PDF
│   │   └── main.css
│   └── data/            # CSV/JSON/YAML data
└── dist/                # Generated output
```

### 3. Configuration (crown.config.js)
```javascript
export default {
  // Input paths
  contentDir: './src/content',
  templateDir: './src/templates',
  stylesDir: './src/styles',
  dataDir: './src/data',
  assetsDir: './src/assets',

  // Output
  outputDir: './dist',

  // PDF settings
  pdfOptions: {
    size: 'letter',
    margin: '1in'
  },

  // Template
  mainTemplate: 'main.hbs',

  // Development
  devServer: {
    port: 3000,
    open: true
  }
}
```

## Core Commands

### Build PDF
```bash
# Build HTML and PDF
npx crown build

# HTML only (no PrinceXML needed)
npx crown build --html-only

# Watch mode
npx crown build --watch
```

### Development Server
```bash
# Start dev server with hot reload
npx crown dev

# Custom port
npx crown dev --port 8080
```

### Clean Output
```bash
npx crown clean
```

## Working with Content

### Markdown Files
Content files use Markdown with frontmatter:

```markdown
---
title: Chapter One
order: 1
author: Your Name
---

# Chapter Title

Your content here...
```

**Ordering:** Use `order` field in frontmatter (not filenames)

### Templates (Handlebars)
Main template (`src/templates/main.hbs`):

```handlebars
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>{{config.title}}</title>
  {{#each styles}}
  <link rel="stylesheet" href="{{this}}">
  {{/each}}
</head>
<body>
  <header>
    <h1>{{config.title}}</h1>
  </header>

  <main>
    {{#each chapters}}
    <article class="chapter">
      <h2>{{this.data.title}}</h2>
      {{{this.content}}}
    </article>
    {{/each}}
  </main>

  <footer>
    <p>© {{config.year}} {{config.author}}</p>
  </footer>
</body>
</html>
```

### Styles for Print
PrinceXML-specific CSS (`src/styles/main.css`):

```css
/* Page setup */
@page {
  size: letter;
  margin: 1in;
  @bottom-center {
    content: counter(page);
  }
}

/* Page breaks */
.chapter {
  page-break-before: always;
}

h1, h2, h3 {
  page-break-after: avoid;
}

/* Print-specific */
@media print {
  .no-print {
    display: none;
  }
}

/* PrinceXML features */
.toc a::after {
  content: leader('.') target-counter(attr(href), page);
}
```

## Data Sources

### Loading External Data
Place files in `src/data/`:
- CSV files (auto-parsed)
- JSON files (auto-loaded)
- YAML files (auto-parsed)

Access in templates:
```handlebars
{{#each data.users}}
  <p>{{this.name}}: {{this.email}}</p>
{{/each}}
```

## Handlebars Helpers

Crown provides built-in helpers:

```handlebars
{{! Date formatting }}
{{formatDate date "YYYY-MM-DD"}}

{{! Conditionals }}
{{#if (eq type "chapter")}}
  Chapter content
{{/if}}

{{! Iteration with index }}
{{#each items}}
  {{@index}}: {{this}}
{{/each}}
```

## Advanced Features

### Custom Handlebars Helpers
Register in `crown.config.js`:

```javascript
export default {
  helpers: {
    uppercase: (str) => str.toUpperCase(),
    multiply: (a, b) => a * b
  }
}
```

### Asset Handling
- Place images/fonts in `src/assets/`
- Referenced automatically in templates
- Copied to output during build

### Multiple Templates
Use partials for reusable components:

```handlebars
{{! src/templates/partials/header.hbs }}
<header>
  <h1>{{title}}</h1>
</header>

{{! In main.hbs }}
{{> header title=config.title}}
```

## Troubleshooting

### Common Issues

**PDF not generating:**
- Ensure PrinceXML is installed: `prince --version`
- Check PATH includes PrinceXML
- Use `--html-only` flag to test HTML generation

**Hot reload not working:**
- Check WebSocket connection in browser console
- Verify port not in use
- Clear browser cache

**Styles not applying:**
- Verify CSS path in template
- Check for PrinceXML-specific syntax
- Test with `--verbose` flag

### Debug Commands
```bash
# Verbose output
npx crown build --verbose

# Check config
npx crown config

# Test PrinceXML directly
prince dist/index.html -o test.pdf
```

## Best Practices

1. **Content Organization:**
   - Use consistent frontmatter
   - Number files for clarity (but use `order` field)
   - Keep chapters focused

2. **Template Design:**
   - Start with semantic HTML
   - Add print styles progressively
   - Test frequently with actual PDF

3. **Performance:**
   - Optimize images for print (300dpi)
   - Minimize template complexity
   - Use CSS instead of inline styles

4. **Version Control:**
   - Commit source files only
   - Gitignore `dist/` directory
   - Track `crown.config.js`

## PrinceXML Features

### Advanced PDF Control
```css
/* Bookmarks */
h1 { bookmark-level: 1; }
h2 { bookmark-level: 2; }

/* Cross-references */
.ref::after {
  content: " (page " target-counter(attr(href), page) ")";
}

/* Footnotes */
.footnote {
  float: footnote;
  footnote-style-position: inside;
}

/* Running headers */
@page {
  @top-center {
    content: string(chapter-title);
  }
}
h2 { string-set: chapter-title content(); }
```

## Example Workflows

### Create a Technical Book
```bash
# Initialize
npx crown init
cd my-tech-book

# Add content
echo "# Introduction" > src/content/00-intro.md
echo "# Chapter 1: Getting Started" > src/content/01-getting-started.md

# Develop with hot reload
npx crown dev

# Build final PDF
npx crown build
```

### Convert Existing Markdown
```bash
# Copy markdown files
cp existing/*.md src/content/

# Add frontmatter to each
for f in src/content/*.md; do
  echo "---\norder: 0\n---\n$(cat $f)" > $f
done

# Build
npx crown build
```

## Resources

- [PrinceXML Documentation](https://www.princexml.com/doc/)
- [Handlebars Guide](https://handlebarsjs.com/guide/)
- [Crown GitHub](https://github.com/yourusername/crown)

---

This skill provides everything needed to work with Crown book projects. Use it when:
- Creating new books/PDFs from markdown
- Setting up Crown projects
- Troubleshooting build issues
- Adding print-specific features
- Working with templates and styles