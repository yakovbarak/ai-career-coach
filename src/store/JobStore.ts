import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { JobApplication } from '../types/job';

export const useJobStore = defineStore('jobStore', () => {
  const jobs = ref<JobApplication[]>([]);

  function addJob(job: JobApplication) {
    jobs.value.push(job);
  }

  function removeJob(id: string) {
    jobs.value = jobs.value.filter((job) => job.id !== id);
  }

  function updateJob(updated: JobApplication) {
    const index = jobs.value.findIndex((j) => j.id === updated.id);
    if (index !== -1) jobs.value[index] = updated;
  }

  return { jobs, addJob, removeJob, updateJob };
});