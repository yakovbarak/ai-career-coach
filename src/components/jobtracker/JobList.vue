<template>
  <div class="space-y-4">
    <!-- Legend + Filters -->
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

      <!-- Filters -->
      <div class="flex gap-4 items-center">
        <label>
          Status:
          <select v-model="selectedStatus" class="border rounded p-1">
            <option value="All">All</option>
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>
        </label>

        <label>
          Sort:
          <select v-model="sortOrder" class="border rounded p-1">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </label>
      </div>
    </div>

    <!-- Job list -->
    <div v-if="filteredAndSortedJobs.length > 0" class="space-y-2">
      <JobItem
        v-for="job in filteredAndSortedJobs"
        :key="job.id"
        :job="job"
      />
    </div>
    <p v-else class="text-gray-500">No jobs to display</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useJobStore } from '../../store/jobStore';
import JobItem from './JobItem.vue';
import type { JobApplication } from '../../types/job';

const jobStore = useJobStore();

// --- Filter & sort state ---
const selectedStatus = ref<'All' | 'Applied' | 'Interview' | 'Offer' | 'Rejected'>('All');
const sortOrder = ref<'newest' | 'oldest'>('newest');

// --- Compute duplicate URLs ---
const normalizeUrl = (u?: string) => (u ?? '').trim();
const duplicateUrls = computed(() => {
  const urlCounts: Record<string, number> = {};
  jobStore.jobs.forEach(j => {
    if (j.url) urlCounts[j.url] = (urlCounts[j.url] || 0) + 1;
  });
  return Object.keys(urlCounts).filter(url => urlCounts[url] > 1);
});

// --- Filter + sort jobs ---
const filteredAndSortedJobs = computed(() => {
  let result: JobApplication[] = [...jobStore.jobs];

  // Filter by status
  if (selectedStatus.value !== 'All') {
    result = result.filter(job => job.status === selectedStatus.value);
  }

  // Sort by createdAt (fallback to dateApplied if missing)
  result.sort((a, b) => {
    const aTime = a.createdAt ?? new Date(a.dateApplied).getTime();
    const bTime = b.createdAt ?? new Date(b.dateApplied).getTime();
    return sortOrder.value === 'newest' ? bTime - aTime : aTime - bTime;
  });

  return result;
});
</script>
