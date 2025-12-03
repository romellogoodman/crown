# Crown Development Guide

Detailed workflows and patterns for developing Crown itself.

## Setup

```bash
git clone <repository>
cd crown
npm install
npm run build
```

## Development Workflow

### Making Changes

1. **Edit source files** in `src/`
2. **Run build** (watch mode recommended):
   ```bash
   npm run dev
   ```
3. **Test manually** in a test project:
   ```bash
   cd /tmp && rm -rf test-crown-book
   mkdir test-crown-book && cd test-crown-book
   cp -r /path/to/crown/templates/default/* .
   npm install /path/to/crown
   npx crown build
   ```

### Build System

Crown uses **tsdown** (powered by Rolldown):

```bash
npm run build        # Full build
npm run dev          # Watch mode
npm run type-check   # TypeScript validation only
```

**Output:**
- `dist/index.mjs` - Main entry point
- `dist/cli.mjs` - CLI executable (auto-chmod +x)
- `dist/index.d.mts` - TypeScript definitions
- `dist/*.map` - Source maps

**Why tsdown?**
- tsup is unmaintained (last commit Nov 2023)
- tsdown is the modern successor built on Rolldown
- Faster builds, better ESM support

### Testing Strategy

Currently manual testing via test projects. Future: automated tests with vitest.

**Test Checklist:**
1. ✅ Build completes without errors
2. ✅ HTML output is correct
3. ✅ PDF generation works (requires Prince)
4. ✅ Dev server starts and serves preview
5. ✅ Hot reload works on file changes
6. ✅ CLI commands execute correctly

**Test Project Creation:**
```bash
# Quick test project
cd /tmp && rm -rf test-crown-book && mkdir test-crown-book
cd test-crown-book
cp -r /path/to/crown/templates/default/* .
npm install /path/to/crown

# Test commands
npx crown build
npx crown dev --no-open  # Manual browser check
npx crown watch          # Ctrl+C to stop
```

## Code Patterns

### Module Imports

Always use `.js` extensions for internal imports (ESM requirement):

```typescript
// ✅ Correct
import { something } from './other.js';

// ❌ Wrong
import { something } from './other';
```

### Error Handling

Use descriptive errors with helpful messages:

```typescript
// ✅ Good
throw new Error(
  `Content not found matching pattern: ${pattern}. ` +
  `Check your crown.config.js input.content setting.`
);

// ❌ Bad
throw new Error('Content not found');
```

### Async Functions

Always await async operations, handle errors appropriately:

```typescript
// ✅ Good
try {
  const result = await operation();
  return result;
} catch (error) {
  throw new Error(`Operation failed: ${(error as Error).message}`);
}

// ❌ Bad (swallows errors)
const result = await operation().catch(() => null);
```

### Configuration Defaults

Always provide sensible defaults in `core/config.ts`:

```typescript
const DEFAULT_CONFIG = {
  page: {
    size: 'A4',  // Sensible default
    margins: {
      top: '2cm',
      bottom: '2cm',
      // ... all margin options
    }
  }
};
```

### Type Safety

Use TypeScript features fully:

```typescript
// Define types
export interface BuildResult {
  success: boolean;
  htmlPath: string;
  pdfPath: string;
  duration: number;
}

// Use types consistently
async function build(): Promise<BuildResult> {
  // Implementation
}
```

## Adding New Features

### New CLI Command

1. **Create command file:**
   ```typescript
   // src/cli/commands/my-command.ts
   export interface MyCommandOptions {
     option?: string;
   }

   export async function myCommand(options: MyCommandOptions): Promise<void> {
     // Implementation
   }
   ```

2. **Register in CLI:**
   ```typescript
   // src/cli/index.ts
   import { myCommand } from './commands/my-command.js';

   program
     .command('my-command')
     .description('Description')
     .option('-o, --option <value>', 'Option description')
     .action(async (options) => {
       await myCommand(options);
     });
   ```

3. **Update README:**
   Add command documentation to README.md

### New Config Option

1. **Update types:**
   ```typescript
   // src/types/config.ts
   export interface CrownConfig {
     // ... existing fields
     myNewOption?: string;
   }
   ```

2. **Add default:**
   ```typescript
   // src/core/config.ts
   const DEFAULT_CONFIG = {
     // ... existing defaults
     myNewOption: 'default-value',
   };
   ```

3. **Use in code:**
   ```typescript
   // Access via resolved config
   const value = config.myNewOption;
   ```

### New Handlebars Helper

**Built-in helper:**
```typescript
// src/core/template.ts - registerBuiltInHelpers()
this.handlebars.registerHelper('myHelper', (arg: string) => {
  return arg.toUpperCase();
});
```

**Usage in templates:**
```handlebars
{{myHelper "text"}}
```

### New Data Format

1. **Add parser:**
   ```typescript
   // src/core/data.ts - loadDataFile()
   case '.xml':
     return parseXml(content);
   ```

2. **Install dependency:**
   ```bash
   npm install fast-xml-parser
   ```

3. **Document in README**

## Common Tasks

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update specific package
npm update package-name

# Update all (careful!)
npm update

# Rebuild after updates
npm run build
```

### Debugging

**Enable verbose logging:**
```bash
# In source code
console.log('Debug info:', data);

# Build to see output
npm run build
```

**Test specific functionality:**
```typescript
// Create test script
// test.mjs
import { compileMarkdownFiles } from './dist/index.mjs';

const files = await compileMarkdownFiles('**/*.md', process.cwd());
console.log(files);
```

**Debug CLI:**
```bash
# Run with Node inspector
node --inspect node_modules/.bin/crown build
```

### Performance Profiling

```typescript
// Use built-in measureTime utility
import { measureTime } from './core/utils.js';

const { result, duration } = await measureTime(async () => {
  return await expensiveOperation();
});
console.log(`Took ${duration}ms`);
```

## Release Process

### Pre-release Checklist

1. ✅ All tests pass (manual testing)
2. ✅ Build succeeds (`npm run build`)
3. ✅ TypeScript validates (`npm run type-check`)
4. ✅ README is up to date
5. ✅ CHANGELOG is updated (future)
6. ✅ Version bumped in package.json

### Version Bumping

```bash
# Patch (0.1.0 → 0.1.1)
npm version patch

# Minor (0.1.0 → 0.2.0)
npm version minor

# Major (0.1.0 → 1.0.0)
npm version major
```

### Publishing

```bash
# Build first
npm run build

# Publish to npm
npm publish

# Or with tag
npm publish --tag beta
```

## Code Style

### TypeScript

- Use `interface` for object shapes
- Use `type` for unions/aliases
- Explicit return types on exported functions
- Avoid `any`, use `unknown` and type guards

### Naming Conventions

- **Files:** kebab-case (`my-file.ts`)
- **Classes:** PascalCase (`MyClass`)
- **Functions:** camelCase (`myFunction`)
- **Constants:** SCREAMING_SNAKE_CASE (`MY_CONSTANT`)
- **Interfaces:** PascalCase, no `I` prefix (`UserConfig`)

### File Organization

```typescript
// 1. Imports
import { external } from 'package';
import { internal } from './other.js';

// 2. Types/Interfaces
export interface MyInterface {}

// 3. Constants
const CONSTANT = 'value';

// 4. Functions
export function myFunction() {}

// 5. Classes
export class MyClass {}
```

## Git Workflow

### Commit Messages

Follow format:
```
Short summary (50 chars or less)

Longer explanation if needed. Wrap at 72 characters.
Explain WHAT and WHY, not HOW (code shows how).

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Branch Strategy

```bash
# Feature branch
git checkout -b feature/my-feature

# Make changes, commit
git add .
git commit -m "Add my feature"

# Merge to main
git checkout main
git merge feature/my-feature
```

## Troubleshooting Development

### "Cannot find module"

Check:
1. Did you run `npm run build`?
2. Are you using `.js` extensions in imports?
3. Is the module exported from index.ts?

### "Type error" during build

```bash
# Check TypeScript directly
npm run type-check

# See full error output
npx tsdown --verbose
```

### Changes not appearing

```bash
# Clean and rebuild
rm -rf dist/
npm run build

# Reinstall in test project
cd /tmp/test-crown-book
npm install /path/to/crown --force
```

### Dev server not reloading

Check:
1. Is watch mode actually running?
2. Are you editing files inside the watched directories?
3. Check console for watcher errors
4. Try restarting dev server

## Resources

- **tsdown docs:** https://tsdown.pages.dev/
- **Rolldown:** https://rolldown.rs/
- **TypeScript:** https://www.typescriptlang.org/
- **Vite:** https://vitejs.dev/
- **Commander:** https://github.com/tj/commander.js
