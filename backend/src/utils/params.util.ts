/**
 * Parameter extraction utilities
 * ✅ SECURITY: Type-safe parameter extraction from Express request
 * ✅ DRY: Reusable across all routes
 */

import { ValidationError } from './errors.util';

/**
 * Extract string parameter from req.params safely
 * @param param - Parameter value from req.params (can be string | string[])
 * @param paramName - Name of the parameter (for error messages)
 * @returns string - First value if array, or the string value
 */
export function extractStringParam(param: string | string[] | undefined, paramName: string = 'parameter'): string {
  if (typeof param === 'string' && param.length > 0) {
    return param;
  }
  throw new ValidationError(`Invalid or missing ${paramName}. Expected a single string.`);
}

/**
 * Extract optional string parameter from req.params safely
 * @param param - Parameter value from req.params (can be string | string[])
 * @returns string | undefined - First value if array, or the string value, or undefined
 */
export function extractOptionalStringParam(param: string | string[] | undefined): string | undefined {
  if (!param) {
    return undefined;
  }
  return Array.isArray(param) ? param[0] : param;
}
