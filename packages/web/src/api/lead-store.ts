import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

export type LeadStatus = "new" | "contacted" | "closed";

export type LeadRecord = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  course: string;
  comment: string | null;
  pageUrl: string | null;
  referrer: string | null;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateLeadInput = {
  name: string;
  phone: string;
  email?: string;
  course: string;
  comment?: string;
  pageUrl?: string;
  referrer?: string;
};

const defaultLeadsPath = fileURLToPath(
  new URL("../../data/leads.json", import.meta.url),
);

const leadsPath = process.env.LEADS_FILE_PATH || defaultLeadsPath;
let writeQueue: Promise<void> = Promise.resolve();

async function readLeads(): Promise<LeadRecord[]> {
  try {
    const raw = await readFile(leadsPath, "utf8");
    const data = JSON.parse(raw) as unknown;
    return Array.isArray(data) ? (data as LeadRecord[]) : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function writeLeads(leads: LeadRecord[]) {
  await mkdir(dirname(leadsPath), { recursive: true });
  const tempPath = `${leadsPath}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(leads, null, 2)}\n`, "utf8");
  await rename(tempPath, leadsPath);
}

function serialized<T>(task: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(task, task);
  writeQueue = run.then(() => undefined, () => undefined);
  return run;
}

export async function createLead(input: CreateLeadInput) {
  return serialized(async () => {
    const leads = await readLeads();
    const now = new Date().toISOString();
    const lead: LeadRecord = {
      id: randomUUID(),
      name: input.name,
      phone: input.phone,
      email: input.email || null,
      course: input.course,
      comment: input.comment || null,
      pageUrl: input.pageUrl || null,
      referrer: input.referrer || null,
      status: "new",
      createdAt: now,
      updatedAt: now,
    };

    leads.unshift(lead);
    await writeLeads(leads.slice(0, 5000));
    return lead;
  });
}

export async function listLeads() {
  const leads = await readLeads();
  return leads.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
  return serialized(async () => {
    const leads = await readLeads();
    const lead = leads.find((item) => item.id === id);
    if (!lead) return null;

    lead.status = status;
    lead.updatedAt = new Date().toISOString();
    await writeLeads(leads);
    return lead;
  });
}
