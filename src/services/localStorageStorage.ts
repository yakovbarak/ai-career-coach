// src/services/localStorageStorage.ts
import type { JobApplication } from '../types/job';
import type { JobStorage } from './storage';

const STORAGE_KEY = 'jobtracker_jobs_v1';

function load(): JobApplication[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((j: any) => ({
      ...j,
      createdAt: typeof j.createdAt === 'number'
        ? j.createdAt
        : (Number.isFinite(Date.parse(j.dateApplied))
            ? new Date(j.dateApplied).getTime()
            : Date.now()),
      url: j.url?.trim() || undefined,
      notes: j.notes?.trim() || undefined
    })) as JobApplication[];
  } catch {
    return [];
  }
}

function save(jobs: JobApplication[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
}

export class LocalStorageJobStorage implements JobStorage {
  private cache: JobApplication[] = load();

  async list() {
    return this.cache.slice();
  }
  async add(job: JobApplication) {
    const withTs = { ...job, createdAt: job.createdAt ?? Date.now() };
    this.cache.push(withTs);
    save(this.cache);
  }
  async update(id: string, patch: Partial<JobApplication>) {
    const i = this.cache.findIndex(j => j.id === id);
    if (i !== -1) {
      this.cache[i] = { ...this.cache[i], ...patch };
      if (this.cache[i].createdAt == null) this.cache[i].createdAt = Date.now();
      save(this.cache);
    }
  }
  async remove(id: string) {
    this.cache = this.cache.filter(j => j.id !== id);
    save(this.cache);
  }
  async clear() {
    this.cache = [];
    save(this.cache);
  }
}
