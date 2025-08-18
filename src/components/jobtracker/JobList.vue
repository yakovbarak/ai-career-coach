<template>
  <div class="space-y-4">
    <!-- Legend + Toggle -->
    <div class="flex items-center justify-between">
      <!-- Legend -->
      <div class="flex gap-4 text-sm">
        <span class="flex items-center gap-1">
          <span class="w-4 h-4 bg-red-300 border rounded"></span> Rejected
        </span>
        <span class="flex items-center gap-1">
          <span class="w-4 h-4 bg-yellow-200 border rounded"></span> Duplicate URL
        </span>
      </div>

      <!-- Toggle -->
      <label class="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" v-model="showDuplicatesOnly" />
        Show only duplicates
      </label>
    </div>

    <!-- Jobs -->
    <div v-if="filteredJobs.length > 0" class="space-y-2">
      <JobItem v-for="job in filteredJobs" :key="job.id" :job="job" />
    </div>
    <p v-else class="text-gray-500">No jobs to display</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useJobStore } from '../../store/JobStore';
import JobItem from './JobItem.vue';

const jobStore = useJobStore();
const showDuplicatesOnly = ref(false);

const normalizeUrl = (u?: string) => (u ?? '').trim();

// Helper to check duplicates
function isDuplicate(url?: string): boolean {
  const normalized = normalizeUrl(url);
  if (!normalized) return false;
  let count = 0;
  for (const j of jobStore.jobs) {
    if (normalizeUrl(j.url) === normalized) count++;
  }
  return count > 1;
}

const filteredJobs = computed(() => {
  if (!showDuplicatesOnly.value) {
    return jobStore.jobs;
  }
  return jobStore.jobs.filter(j => isDuplicate(j.url));
});
</script>