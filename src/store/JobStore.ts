import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import type { JobApplication } from '../types/job';

const STORAGE_KEY = 'jobtracker_jobs_v1';

function isJobApplication(x: any): x is JobApplication {
  return (
    x &&
    typeof x.id === 'string' &&
    typeof x.company === 'string' &&
    typeof x.position === 'string' &&
    typeof x.status === 'string' &&
    typeof x.dateApplied === 'string'
  );
}

function sanitizeJobs(raw: any): JobApplication[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(isJobApplication)
    .map((j) => {
      // Ensure optional fields are the right shape
      const url = typeof j.url === 'string' && j.url.trim() ? j.url.trim() : undefined;
      const notes = typeof j.notes === 'string' && j.notes.trim() ? j.notes : undefined;

      // createdAt fallback: use existing if present; else derive from dateApplied or now
      const createdAt =
        typeof j.createdAt === 'number'
          ? j.createdAt
          : Number.isFinite(Date.parse(j.dateApplied))
            ? new Date(j.dateApplied).getTime()
            : Date.now();

      return {
        ...j,
        url,
        notes,
        createdAt,
      } as JobApplication;
    });
}

export const useJobStore = defineStore('jobStore', () => {
  const jobs = ref<JobApplication[]>([]);

  function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs.value));
  }

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      jobs.value = sanitizeJobs(parsed);
    } catch {
      // ignore parse errors; start fresh
      jobs.value = [];
    }
  }

  // ---- Actions (same API you already use) ----
  function addJob(job: JobApplication) {
    // ensure createdAt is set for new jobs
    const withTs: JobApplication = {
      ...job,
      createdAt: job.createdAt ?? Date.now(),
    };
    jobs.value.push(withTs);
  }

  function removeJob(id: string) {
    jobs.value = jobs.value.filter((j) => j.id !== id);
  }

  // patch-style update
  function updateJob(id: string, patch: Partial<JobApplication>) {
    const idx = jobs.value.findIndex((j) => j.id === id);
    if (idx !== -1) {
      const updated = { ...jobs.value[idx], ...patch } as JobApplication;
      // keep createdAt stable; if missing, set it now
      if (updated.createdAt == null) updated.createdAt = Date.now();
      jobs.value[idx] = updated;
    }
  }

  function clearAll() {
    jobs.value = [];
  }

  // ---- init: hydrate + auto-save on change ----
  loadFromStorage();
  watch(
    jobs,
    () => {
      saveToStorage();
    },
    { deep: true }
  );

  return { jobs, addJob, removeJob, updateJob, clearAll };
});
