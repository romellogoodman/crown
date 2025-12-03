# Crown Architecture

Detailed technical documentation for Crown's architecture and design decisions.

## Module Overview

### Core Modules (`src/core/`)

#### `config.ts` - Configuration Management
- Uses cosmiconfig to find config files (`crown.config.{js,ts,json}`)
- Resolves user config with defaults
- Validates required fields
- Resolves all paths relative to config file location

**Key functions:**
- `loadConfig(searchFrom)` - Find and load config
- `resolveConfig(userConfig, root)` - Merge with defaults
- `validateEnvironment()` - Check PrinceXML availability

#### `markdown.ts` - Markdown Compilation
- Uses marked for MD → HTML conversion
- gray-matter for YAML frontmatter parsing
- Glob pattern matching for content files
- Content sorting by `order` field or filename

**Key functions:**
- `compileMarkdownFiles(pattern, root)` - Compile all matching files
- `compileMarkdownFile(filePath, root)` - Single file compilation
- `createMarkdownHelper()` - Handlebars helper for inline markdown

#### `template.ts` - Template Rendering
- Handlebars template engine
- Automatic partial discovery from `templates/partials/`
- Built-in helpers (markdown, json, formatDate, eq, gt, lt, etc.)
- Custom helper loading from external files

**Key class:** `TemplateRenderer`
- `registerPartials()` - Auto-load partials
- `registerCustomHelpers(path)` - Load custom helpers
- `render(context)` - Render template with context

#### `builder.ts` - Build Orchestration
- Coordinates entire build pipeline
- Error handling and recovery
- Build timing and statistics
- Asset copying (styles, etc.)

**Key class:** `Builder`
- `build()` - Full build pipeline
- `buildSafe()` - Build with error recovery (for watch mode)
- `copyAssets()` - Copy styles and other assets

#### `prince.ts` - PrinceXML Integration
- Spawns prince CLI process
- Parses output for warnings/errors
- Supports all Prince command-line options
- PDF metadata configuration

**Key functions:**
- `runPrince(htmlPath, pdfPath, options)` - Run Prince
- `configToPrinceOptions(config)` - Convert config to Prince options
- `checkPrinceAvailable()` - Verify Prince installation

#### `data.ts` - Data Loading
- CSV parsing via Papa Parse
- JSON loading
- YAML parsing
- Multiple data source support

**Key functions:**
- `loadData(dataSources, root)` - Load all data sources
- `loadDataFile(filePath)` - Load single data file by extension

#### `utils.ts` - Shared Utilities
- Path resolution
- Directory creation
- Performance timing
- Content sorting
- Debouncing

### Development Modules (`src/dev/`)

#### `server.ts` - Vite Dev Server
- Configures and starts Vite server
- Integrates Crown plugin
- Handles auto-opening browser
- WebSocket for HMR

**Key function:**
- `startDevServer(config, options)` - Start dev server

#### `plugin.ts` - Vite Plugin
- Serves preview page at `/`
- Serves generated PDF at `/book.pdf`
- WebSocket notifications for rebuild events
- File watching integration

**Events:**
- `crown:building` - Build started
- `crown:success` - Build succeeded
- `crown:error` - Build failed

#### `watcher.ts` - File Watching
- Chokidar-based file watcher
- Debounced rebuild triggering (300ms)
- Smart change detection by file type
- Config change detection (requires restart)

**Key class:** `Watcher`
- Watches: content (`.md`), templates (`.html`, `.hbs`), styles (`.css`), config, helpers

#### `preview.html` - Preview Page
- Static HTML served by dev server
- Loads PDF in iframe
- WebSocket client for HMR
- Build status display
- Error overlay

### CLI Modules (`src/cli/`)

#### `index.ts` - CLI Entry Point
- Commander-based CLI
- Command registration
- Global error handling
- Version display

#### `commands/` - CLI Commands
- `build.ts` - Production build
- `dev.ts` - Dev server
- `watch.ts` - Watch mode (no server)
- `preview.ts` - Preview HTML/PDF
- `create.ts` - Project scaffolding

#### `logger.ts` - Pretty Logging
- Colored console output using picocolors
- Consistent logging format
- Status indicators (✔, ✖, ⚠, ℹ, 👑)

## Data Flow

### Build Pipeline Flow

```
User Content (Markdown)
    ↓
compileMarkdownFiles() - Parse frontmatter, convert to HTML
    ↓
loadData() - Load CSV/JSON/YAML
    ↓
TemplateRenderer.render() - Combine content + data + template
    ↓
Write HTML + Copy Assets
    ↓
runPrince() - Generate PDF
    ↓
Output: HTML + PDF files
```

### Dev Server Flow

```
User starts dev server
    ↓
Vite server starts with Crown plugin
    ↓
Initial build executes
    ↓
Browser opens to preview page (iframe with PDF)
    ↓
File watcher starts
    ↓
User edits file
    ↓
Watcher detects change → debounce 300ms
    ↓
Rebuild triggered
    ↓
WebSocket sends event to browser
    ↓
Iframe reloads PDF (with cache bust timestamp)
```

### Template Context Structure

```typescript
{
  metadata: {
    title: string,
    author: string,
    subject: string,
    keywords: string[],
    lang: string
  },
  chapters: [{
    path: string,
    absolutePath: string,
    frontmatter: {
      title?: string,
      order?: number,
      // ... custom fields
    },
    html: string,
    raw: string
  }],
  data: {
    [key: string]: any  // From data sources
  },
  generatedDate: Date
}
```

## Key Design Patterns

### 1. Progressive Enhancement
Start with simple markdown → HTML → PDF pipeline. Add features incrementally:
- Base: Markdown + templates
- +Data: External data sources
- +Helpers: Custom template helpers
- +Watch: File watching
- +HMR: Hot reload dev server

### 2. Separation of Concerns
- `core/` - Pure build logic, no CLI/dev server
- `dev/` - Development experience, no build logic
- `cli/` - User interface, delegates to core/dev

### 3. Configuration Over Convention
Users explicitly configure:
- Content location (glob pattern)
- Template structure
- Output locations
- Metadata

No magic directories or hardcoded paths.

### 4. Graceful Degradation
- Build continues after Prince errors (HTML still generated)
- Watch mode continues after build failures
- Missing Prince shows helpful error message

### 5. Type Safety
Full TypeScript coverage:
- Config schema with defaults
- Content structure
- Template context
- Build results

## Performance Considerations

### Build Performance
- Parallel markdown compilation via Promise.all
- Template caching (Handlebars compiles once)
- Asset copying only when changed
- Prince runs only if HTML changed (future optimization)

### Dev Server Performance
- Debounced file watching (300ms)
- Incremental rebuilds (only changed content)
- WebSocket for instant notifications
- PDF cache busting (query string timestamp)

### Memory Management
- Stream-based file reading where possible
- No in-memory PDF buffering (Prince writes to disk)
- Limited glob results (reasonable project sizes)

## Extension Points

### Adding New Data Formats
1. Add case to `loadDataFile()` in `data.ts`
2. Install parser dependency
3. Parse and return data

### Adding New Template Helpers
Built-in helpers in `template.ts`:
```typescript
this.handlebars.registerHelper('name', (arg, options) => {
  // Process and return result
});
```

Custom helpers via config:
```javascript
// helpers.js
export default {
  helperName(arg) {
    return result;
  }
};
```

### Custom Prince Options
Add to config:
```javascript
prince: {
  options: ['--pdf-profile=PDF/X-3', '--compress']
}
```

### Custom Vite Configuration
Future: Allow users to extend Vite config via `devServer.vite` config option.

## Security Considerations

### User Input
- Config files are trusted (user's own code)
- Markdown content is trusted (user's own content)
- No arbitrary code execution from untrusted sources
- Prince options validated (only known flags)

### File System Access
- All paths resolved relative to config location
- No arbitrary file system access
- Glob patterns restricted to configured directories

### Network
- No network requests from framework (except Vite dev server)
- Prince can fetch remote resources (user's choice)

## Troubleshooting

### Common Issues

**"prince not found"**
- PrinceXML not installed or not in PATH
- Solution: Install from https://www.princexml.com/download/

**"Module type not specified"**
- User project missing `"type": "module"` in package.json
- Crown is ESM-only

**"Named export not found" (papaparse)**
- CommonJS compatibility issue
- Solution: Import as default: `import Papa from 'papaparse'`

**Build succeeds but no PDF**
- Check HTML was generated
- Run Prince manually for detailed error
- Check Prince version compatibility

## Future Enhancements

### Planned Features
- SCSS compilation (sass package)
- Syntax highlighting (highlight.js or Shiki)
- Image optimization (sharp)
- Multiple template support
- Plugin system (similar to Vite plugins)
- Prince for Books features (advanced typography)

### Performance Optimizations
- Incremental compilation (only changed content)
- Parallel asset processing
- Build caching
- Smart Prince reruns (hash-based)

### Developer Experience
- Better error messages with source locations
- Progress indicators for long builds
- Build statistics and recommendations
- VSCode extension for config/template autocomplete
