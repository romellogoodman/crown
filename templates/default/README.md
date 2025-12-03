# My Book

A book created with [Crown](https://github.com/yourusername/crown), a modern framework for creating print-quality PDFs with PrinceXML.

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
.
├── src/
│   ├── content/          # Markdown content files
│   ├── templates/        # Handlebars templates
│   └── styles.css        # Main stylesheet
├── dist/                 # Generated files
│   ├── book.html
│   └── book.pdf
└── crown.config.js       # Crown configuration
```

## Writing Content

Add new content by creating `.md` files in `src/content/`. Each file should have frontmatter:

```markdown
---
title: Chapter Title
subtitle: Optional subtitle
id: chapter-id
order: 1
---

# Chapter Title

Your content here...
```

## Customizing

- Edit `src/styles.css` to change the book's appearance
- Modify `src/templates/layout.html` to change the structure
- Update `crown.config.js` to change metadata and settings

## Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production PDF
- `npm run watch` - Watch and rebuild (without dev server)
- `npm run preview:html` - Open HTML in browser
- `npm run preview:pdf` - Open PDF in default viewer
