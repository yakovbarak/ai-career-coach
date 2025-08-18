<template>
  <div class="space-y-4">
    <!-- ⚠️ Global Duplicate Warning -->
    <div v-if="hasDuplicates" class="bg-yellow-300 text-black p-3 rounded">
      ⚠️ Duplicate job URLs detected! Please review highlighted rows.
    </div>

    <JobItem v-for="job in jobs" :key="job.id" :job="job" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useJobStore } from '../../store/JobStore';
import JobItem from './JobItem.vue';

const jobStore = useJobStore();
const jobs = computed(() => jobStore.jobs);

// check if there are any duplicate URLs in the job list
const hasDuplicates = computed(() => {
  const urlCounts: Record<string, number> = {};
  for (const job of jobs.value) {
    if (job.url) {
      urlCounts[job.url] = (urlCounts[job.url] || 0) + 1;
    }
  }
  return Object.values(urlCounts).some(count => count > 1);
});
</script>