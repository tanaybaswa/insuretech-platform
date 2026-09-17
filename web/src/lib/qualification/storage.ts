import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

export function absoluteUploadPath(storageKey: string) {
  return path.join(UPLOAD_ROOT, storageKey);
}

export async function saveUploadFile(params: {
  caseId: string;
  originalName: string;
  bytes: Buffer;
}) {
  const safeName = params.originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const assetId = randomUUID();
  const storageKey = path.join(params.caseId, `${assetId}-${safeName}`);
  const fullPath = absoluteUploadPath(storageKey);
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, params.bytes);
  return { assetId, storageKey, safeName };
}
