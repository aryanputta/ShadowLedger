import { createHash } from "crypto";

export const hashJson = (value: unknown): string =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");

export const computeEventHash = (
  payloadHash: string,
  previousEventHash?: string,
): string => hashJson({ payloadHash, previousEventHash: previousEventHash ?? null });
