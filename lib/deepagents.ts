import { exec as execCb, spawn } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execCb);

export type AppSettings = {
  defaultModel: string;
  defaultProvider?: string;
  defaultBaseUrl?: string;
  shellAllowList: string;
  autoApprove: boolean;
};

export type BgSession = {
  id: string;
  command: string;
  status: "running" | "done" | "error";
  output: string;
  startedAt: string;
  endedAt?: string;
  code?: number | null;
};

const sessions = new Map<string, BgSession>();

function buildArgs(base: string[], settings?: Partial<AppSettings>, opts?: { agent?: string; model?: string }) {
  const args = [...base];
  if (opts?.agent) args.push("--agent", opts.agent);
  const selectedModel = opts?.model || settings?.defaultModel;
  if (selectedModel) args.push("--model", selectedModel);
  if (settings?.shellAllowList) args.push("--shell-allow-list", settings.shellAllowList);
  if (settings?.autoApprove) args.push("--auto-approve");
  return args;
}

export async function runDeepagentsList() {
  const { stdout, stderr } = await exec("deepagents list --json || deepagents list", { maxBuffer: 2 * 1024 * 1024 });
  return { stdout, stderr };
}

export async function runThreadsList() {
  const { stdout, stderr } = await exec("deepagents threads list --json || deepagents threads list", { maxBuffer: 2 * 1024 * 1024 });
  return { stdout, stderr };
}

export async function runThreadsDelete(id: string) {
  const { stdout, stderr } = await exec(`deepagents threads delete ${JSON.stringify(id)}`);
  return { stdout, stderr };
}

export async function runSkillsList() {
  const { stdout, stderr } = await exec("deepagents skills list --json || deepagents skills list", { maxBuffer: 2 * 1024 * 1024 });
  return { stdout, stderr };
}

export async function runSkillInfo(name: string) {
  const { stdout, stderr } = await exec(`deepagents skills info ${JSON.stringify(name)} --json || deepagents skills info ${JSON.stringify(name)}`);
  return { stdout, stderr };
}

export async function runSkillDelete(name: string) {
  const { stdout, stderr } = await exec(`deepagents skills delete ${JSON.stringify(name)}`);
  return { stdout, stderr };
}

export async function runOneShot(task: string, settings?: Partial<AppSettings>, opts?: { agent?: string; model?: string }) {
  const args = buildArgs(["-n", task], settings, opts);
  const cmd = ["deepagents", ...args.map((a) => JSON.stringify(a))].join(" ");
  const { stdout, stderr } = await exec(cmd, { maxBuffer: 8 * 1024 * 1024 });
  return { stdout, stderr, cmd };
}

export function runBackground(task: string, settings?: Partial<AppSettings>, opts?: { agent?: string; model?: string }) {
  const id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const args = buildArgs(["-n", task], settings, opts);
  const child = spawn("deepagents", args, { stdio: ["ignore", "pipe", "pipe"] });

  const state: BgSession = {
    id,
    command: `deepagents ${args.join(" ")}`,
    status: "running",
    output: "",
    startedAt: new Date().toISOString(),
  };

  sessions.set(id, state);

  child.stdout.on("data", (d) => {
    state.output += d.toString();
  });
  child.stderr.on("data", (d) => {
    state.output += d.toString();
  });
  child.on("close", (code) => {
    state.code = code;
    state.endedAt = new Date().toISOString();
    state.status = code === 0 ? "done" : "error";
  });

  return state;
}

export function listBgSessions() {
  return Array.from(sessions.values()).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export function getBgSession(id: string) {
  return sessions.get(id) || null;
}

export function removeBgSession(id: string) {
  return sessions.delete(id);
}
