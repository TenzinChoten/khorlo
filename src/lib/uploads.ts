import { mkdir, readFile, writeFile } from "fs/promises";
import { join } from "path";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
};

export function getUploadDir(): string {
  // [Reason] Render can mount a persistent disk; default stays the existing public/uploads folder
  return process.env.UPLOAD_DIR?.trim() || join(process.cwd(), "public", "uploads");
}

export function sanitizeUploadFilename(filename: string): string | null {
  const trimmed = filename.trim();
  if (!trimmed || trimmed.includes("..") || trimmed.includes("/") || trimmed.includes("\\")) {
    return null;
  }
  return trimmed;
}

export function contentTypeForFilename(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return CONTENT_TYPES[ext] || "application/octet-stream";
}

export async function saveUpload(filename: string, buffer: Buffer): Promise<string> {
  const dir = getUploadDir();
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, filename), buffer);
  return `/uploads/${filename}`;
}

export async function readUpload(
  filename: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const safe = sanitizeUploadFilename(filename);
  if (!safe) {
    return null;
  }

  const candidates = [
    join(getUploadDir(), safe),
    join(process.cwd(), "public", "uploads", safe),
  ];

  for (const path of candidates) {
    try {
      const buffer = await readFile(path);
      return { buffer, contentType: contentTypeForFilename(safe) };
    } catch {
      // [Reason] Try the next known upload folder before treating the file as missing
    }
  }

  return null;
}
