import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { JobApplication } from '../types/job';

export const useJobStore = defineStore('jobStore', () => {
  const jobs = ref<JobApplication[]>([]);

  function addJob(job: JobApplication) {
    jobs.value.push(job);
  }

  function removeJob(id: string) {
    jobs.value = jobs.value.filter(j => j.id !== id);
  }

  // ⬇️ Patch-style update to avoid replacing the whole object incorrectly
  function updateJob(id: string, patch: Partial<JobApplication>) {
    const idx = jobs.value.findIndex(j => j.id === id);
    if (idx !== -1) {
      jobs.value[idx] = { ...jobs.value[idx], ...patch };
    }
  }

  return { jobs, addJob, removeJob, updateJob };
});