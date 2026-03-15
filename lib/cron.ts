import cron, { type ScheduledTask } from "node-cron";
import { readJsonFile, writeJsonFile } from "@/lib/storage";
import { AppSettings, runBackground } from "@/lib/deepagents";

export type CronJobDef = {
  id: string;
  name: string;
  expression: string;
  prompt: string;
  agent?: string;
  enabled: boolean;
  lastRunAt?: string;
  lastStatus?: "ok" | "error";
};

const defaults: AppSettings = { defaultModel: "", shellAllowList: "recommended", autoApprove: false };
const registry = new Map<string, ScheduledTask>();
let bootstrapped = false;

export async function getCrons() {
  return readJsonFile<CronJobDef[]>("crons.json", []);
}

export async function saveCrons(items: CronJobDef[]) {
  await writeJsonFile("crons.json", items);
}

export async function runCronNow(item: CronJobDef) {
  try {
    const settings = await readJsonFile<AppSettings>("settings.json", defaults);
    runBackground(item.prompt, settings, { agent: item.agent });
    item.lastRunAt = new Date().toISOString();
    item.lastStatus = "ok";
  } catch {
    item.lastRunAt = new Date().toISOString();
    item.lastStatus = "error";
  }
}

function stopTask(id: string) {
  const t = registry.get(id);
  if (!t) return;
  t.stop();
  t.destroy();
  registry.delete(id);
}

function upsertTask(item: CronJobDef) {
  stopTask(item.id);
  if (!item.enabled) return;
  if (!cron.validate(item.expression)) return;
  const task = cron.schedule(item.expression, async () => {
    const all = await getCrons();
    const current = all.find((c) => c.id === item.id);
    if (!current || !current.enabled) return;
    await runCronNow(current);
    await saveCrons(all);
  });
  registry.set(item.id, task);
}

export async function syncCronTasks() {
  const all = await getCrons();
  const ids = new Set(all.map((c) => c.id));
  for (const id of registry.keys()) {
    if (!ids.has(id)) stopTask(id);
  }
  for (const item of all) upsertTask(item);
}

export async function ensureCronBootstrap() {
  if (bootstrapped) return;
  bootstrapped = true;
  await syncCronTasks();
}
