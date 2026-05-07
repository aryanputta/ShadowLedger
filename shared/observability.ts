export const structuredLog = (
  service: string,
  message: string,
  context: Record<string, unknown> = {},
): void => {
  console.log(
    JSON.stringify({
      service,
      message,
      timestamp: new Date().toISOString(),
      ...context,
    }),
  );
};

export const fullJitterBackoffMs = (attempt: number, baseMs = 100): number => {
  const cap = baseMs * 2 ** attempt;
  return Math.floor(Math.random() * cap);
};
