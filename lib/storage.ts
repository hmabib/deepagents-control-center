import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");

export async function ensureDataDir() {
  await mkdir(dataDir, { recursive: true });
}

export async function readJsonFile<T>(file: string, fallback: T): Promise<T> {
  await ensureDataDir();
  const full = path.join(dataDir, file);
  try {
    const raw = await readFile(full, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    await writeJsonFile(file, fallback);
    return fallback;
  }
}

export async function writeJsonFile<T>(file: string, value: T) {
  await ensureDataDir();
  const full = path.join(dataDir, file);
  await writeFile(full, JSON.stringify(value, null, 2), "utf8");
}
