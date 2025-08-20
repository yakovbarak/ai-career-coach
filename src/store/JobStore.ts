

// src/store/jobStore.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { JobApplication } from '../types/job';
import type { JobStorage } from '../services/storage';
import { LocalStorageJobStorage } from '../services/localStorageStorage';

function sanitizeImportedJob(j: any): JobApplication | null {
  if (!j) return null;
  const id = typeof j.id === 'string' && j.id.trim() ? j.id.trim() : null;
  if (!id) return null;

  const status: JobApplication['status'] =
    j.status === 'Applied' || j.status === 'Interview' || j.status === 'Offer' || j.status === 'Rejected'
      ? j.status
      : 'Applied';

  const dateApplied =
    typeof j.dateApplied === 'string' && j.dateApplied
      ? j.dateApplied
      : new Date().toISOString().split('T')[0];

  const createdAt =
  typeof j.createdAt === 'number'
    ? j.createdAt
    : (Number.isFinite(Date.parse(dateApplied)) ? new Date(dateApplied).getTime() : Date.now());


  const recruiter =
    j.recruiter && typeof j.recruiter === 'object'
      ? {
          name:  typeof j.recruiter.name  === 'string' && j.recruiter.name.trim()  ? j.recruiter.name  : undefined,
          email: typeof j.recruiter.email === 'string' && j.recruiter.email.trim() ? j.recruiter.email : undefined,
          phone: typeof j.recruiter.phone === 'string' && j.recruiter.phone.trim() ? j.recruiter.phone : undefined,
        }
      : undefined;

  const job: JobApplication = {
    id,
    company: typeof j.company === 'string' ? j.company : '',
    position: typeof j.position === 'string' ? j.position : '',
    status,
    dateApplied,
    notes: typeof j.notes === 'string' && j.notes.trim() ? j.notes : undefined,
    url:   typeof j.url   === 'string' && j.url.trim()   ? j.url   : undefined,
    createdAt,
    jobDescription: typeof j.jobDescription === 'string' && j.jobDescription.trim() ? j.jobDescription : undefined,
    recruiter,
  };
  return job;
}

const storage: JobStorage = new LocalStorageJobStorage(); // ← swap later

export const useJobStore = defineStore('jobStore', () => {
  const jobs = ref<JobApplication[]>([]);

  async function refresh() {
    jobs.value = await storage.list();
  }

  async function addJob(job: JobApplication) {
    await storage.add({ ...job, createdAt: job.createdAt ?? Date.now() });
    await refresh();
  }

  async function removeJob(id: string) {
    await storage.remove(id);
    await refresh();
  }

  async function updateJob(id: string, patch: Partial<JobApplication>) {
    await storage.update(id, patch);
    await refresh();
  }

  // 🚑 FIX: FULL REPLACE MUST UPDATE THE ADAPTER, NOT JUST PINIA
  async function replaceAll(newJobs: JobApplication[]) {
    // normalize ids to strings & fill createdAt
    const clean = newJobs.map(j => ({
      ...j,
      id: String(j.id),
      createdAt: typeof j.createdAt === 'number' ? j.createdAt : Date.now(),
    }));
    await storage.clear?.();
    for (const j of clean) await storage.add(j);
    await refresh(); // <-- updates Pinia state from adapter
  }

  async function importFromRaw(rawJson: string) {
    const parsed = JSON.parse(rawJson);
    const arr = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.jobs) ? parsed.jobs : [];
    const cleaned: JobApplication[] = [];
    for (const item of arr) {
      const sj = sanitizeImportedJob(item);
      if (sj) cleaned.push(sj);
    }
    await replaceAll(cleaned); // <-- go through adapter
  }

  function exportToJson(): string {
    // Optional: export directly from state (already in sync after refresh)
    return JSON.stringify(jobs.value, null, 2);
    // Or, to be extra-safe:
    // const data = await storage.list(); return JSON.stringify(data, null, 2);
  }

  // initial load
  refresh();

  return { jobs, addJob, removeJob, updateJob, replaceAll, importFromRaw, exportToJson, refresh };
});
