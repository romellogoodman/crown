/**
 * Crown configuration type definitions
 */

export interface CrownConfig {
  /**
   * Input configuration
   */
  input: {
    /** Glob pattern for content files (markdown) */
    content: string;
    /** Path to main template file */
    template: string;
    /** Path to main stylesheet */
    styles: string;
  };

  /**
   * Output configuration
   */
  output: {
    /** Output path for compiled HTML */
    html: string;
    /** Output path for generated PDF */
    pdf: string;
  };

  /**
   * Book metadata
   */
  metadata?: {
    /** Book title */
    title?: string;
    /** Author name */
    author?: string;
    /** Book subject */
    subject?: string;
    /** Keywords for PDF metadata */
    keywords?: string[];
    /** Language code (e.g., 'en', 'es') */
    lang?: string;
  };

  /**
   * Page configuration
   */
  page?: {
    /** Page size (e.g., 'A4', 'letter', '5.5in 8.5in') */
    size?: string;
    /** Page margins */
    margins?: {
      top?: string;
      bottom?: string;
      left?: string;
      right?: string;
      inside?: string;
      outside?: string;
    };
  };

  /**
   * Prince-specific options
   */
  prince?: {
    /** Enable JavaScript execution in Prince */
    javascript?: boolean;
    /** Verbose output from Prince */
    verbose?: boolean;
    /** Additional Prince command-line options */
    options?: string[];
    /** Path to Prince executable (defaults to 'prince' in PATH) */
    executablePath?: string;
  };

  /**
   * Development server configuration
   */
  devServer?: {
    /** Port for dev server */
    port?: number;
    /** Host for dev server */
    host?: string;
    /** Open browser automatically */
    open?: boolean;
  };

  /**
   * Data sources for templates
   */
  data?: Record<string, string>;

  /**
   * Path to custom Handlebars helpers
   */
  helpers?: string;

  /**
   * Root directory (usually where config file is located)
   * @internal
   */
  root?: string;
}

/**
 * Resolved configuration with all defaults applied
 */
export interface ResolvedCrownConfig extends Required<Omit<CrownConfig, 'metadata' | 'page' | 'prince' | 'devServer' | 'data' | 'helpers'>> {
  metadata: Required<NonNullable<CrownConfig['metadata']>>;
  page: {
    size: string;
    margins: Required<NonNullable<CrownConfig['page']>['margins']>;
  };
  prince: Required<NonNullable<CrownConfig['prince']>>;
  devServer: Required<NonNullable<CrownConfig['devServer']>>;
  data: Record<string, string>;
  helpers: string | null;
  root: string;
}

/**
 * Helper function for defining config with type checking
 */
export function defineConfig(config: CrownConfig): CrownConfig {
  return config;
}
