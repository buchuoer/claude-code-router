/**
 * Read route group configuration file
 */

import * as fs from 'fs';
import * as path from 'path';
import { ROUTE_GROUPS_DIR } from '../constants';

/**
 * Read route group configuration file
 * @param name Route group name
 * @returns Route group configuration object, or null if file does not exist
 */
export function readRouteGroupFile(name: string): any | null {
  try {
    const filePath = path.join(ROUTE_GROUPS_DIR, `${name}.json`);
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return null;
    }
    console.error(`Failed to read route group file: ${error.message}`);
    return null;
  }
}

/**
 * List all route groups
 * @returns Array of route group names
 */
export function listRouteGroups(): string[] {
  try {
    if (!fs.existsSync(ROUTE_GROUPS_DIR)) {
      return [];
    }
    const files = fs.readdirSync(ROUTE_GROUPS_DIR);
    return files
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''));
  } catch (error: any) {
    console.error(`Failed to list route groups: ${error.message}`);
    return [];
  }
}
