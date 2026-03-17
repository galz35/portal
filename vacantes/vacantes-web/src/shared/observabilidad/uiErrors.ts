export function reportUiError(error: unknown, context?: Record<string, unknown>) {
  console.error("[vacantes-web][ui-error]", error, context ?? {});
}
