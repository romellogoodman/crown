/**
 * Data loading for templates (CSV, JSON, YAML)
 */

import { readFile } from 'node:fs/promises';
import Papa from 'papaparse';
import { parse as parseYaml } from 'yaml';
import { extname } from 'node:path';
import { resolvePath } from './utils.js';

/**
 * Load all data sources specified in config
 */
export async function loadData(
  dataSources: Record<string, string>,
  root: string
): Promise<Record<string, unknown>> {
  const data: Record<string, unknown> = {};

  for (const [key, path] of Object.entries(dataSources)) {
    const absolutePath = resolvePath(root, path);
    data[key] = await loadDataFile(absolutePath);
  }

  return data;
}

/**
 * Load a single data file based on extension
 */
async function loadDataFile(filePath: string): Promise<unknown> {
  const ext = extname(filePath).toLowerCase();
  const content = await readFile(filePath, 'utf-8');

  switch (ext) {
    case '.json':
      return JSON.parse(content);

    case '.csv':
      return parseCsvData(content);

    case '.yaml':
    case '.yml':
      return parseYaml(content);

    default:
      throw new Error(
        `Unsupported data file format: ${ext}. Supported formats: .json, .csv, .yaml, .yml`
      );
  }
}

/**
 * Parse CSV data with headers
 */
function parseCsvData(content: string): unknown {
  const result = Papa.parse(content, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true, // Convert numbers and booleans
  });

  if (result.errors.length > 0) {
    throw new Error(
      `CSV parsing errors: ${result.errors.map((e) => e.message).join(', ')}`
    );
  }

  return result.data;
}
