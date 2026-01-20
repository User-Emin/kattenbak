/**
 * Parameter extraction utilities
 * ✅ SECURITY: Type-safe parameter extraction from Express request
 * ✅ DRY: Reusable across all routes
 */

/**
 * Extract string parameter from req.params safely
 * @param param - Parameter value from req.params (can be string | string[])
 * @returns string - First value if array, or the string value
 */
export function extractStringParam(param: string | string[] | undefined): string {
  if (!param) {
    throw new Error('Parameter is required');
  }
  return Array.isArray(param) ? param[0] : param;
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
