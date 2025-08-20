<template>
  <div class="space-y-4">
    <!-- Legend -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex gap-4 text-sm">
        <span class="flex items-center gap-1">
          <span class="w-4 h-4 bg-red-300 border rounded"></span> Rejected
        </span>
        <span class="flex items-center gap-1">
          <span class="w-4 h-4 bg-yellow-200 border rounded"></span> Duplicate URL
        </span>
      </div>

      <!-- Filters & Sort -->
      <div class="flex flex-wrap gap-3 items-center">
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
          Company:
          <select v-model="selectedCompany" class="border rounded p-1">
            <option :value="ALL_COMPANIES">All</option>
            <option
              v-for="c in companies"
              :key="c"
              :value="c"
            >
              {{ c }}
            </option>
          </select>
        </label>

        <label>
          Sort by:
          <select v-model="sortKey" class="border rounded p-1">
            <option value="date">Date</option>
            <option value="company">Company</option>
            <option value="position">Position</option>
          </select>
        </label>

        <label>
          Direction:
          <select v-model="sortDir" class="border rounded p-1">
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </label>
        <!-- Reset Filters -->
        <button
          class="border rounded px-3 py-1 disabled:opacity-50"
          :disabled="isDefaultFilters"
          @click="resetFilters"
          title="Reset to Status: All, Company: All, Sort: Date/Desc"
        >
          Reset filters
        </button>
        <!-- Export -->
        <button class="border rounded px-3 py-1" @click="handleExport">
          Export JSON
        </button>

        <!-- Import (replaces all) -->
        <label class="border rounded px-3 py-1 cursor-pointer" title="This will replace all current jobs">
          Import JSON (replaces all)
          <input type="file" accept="application/json" class="hidden" @change="handleImport" />
        </label>
      </div>
    </div>

    <!-- Global duplicate banner (unchanged behavior) -->
    <div v-if="hasDuplicates" class="bg-yellow-300 text-black p-3 rounded">
      ⚠️ Duplicate job URLs detected! Please review highlighted rows.
    </div>

    <!-- Job list -->
    <div v-if="filteredAndSortedJobs.length" class="space-y-2">
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
import { useJobStore } from '../../store/JobStore';
import JobItem from './JobItem.vue';
import type { JobApplication } from '../../types/job';

const jobStore = useJobStore();

// --- constants ---
const ALL_COMPANIES = '__ALL__' as const;

// --- state for controls ---
const selectedStatus = ref<'All' | JobApplication['status']>('All');
const selectedCompany = ref<string>(ALL_COMPANIES);
const sortKey = ref<'date' | 'company' | 'position'>('date');
const sortDir = ref<'asc' | 'desc'>('desc');


function download(filename: string, text: string) {
  const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function handleExport() {
  const json = jobStore.exportToJson();
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  download(`jobtracker-export-${stamp}.json`, json);
}

function handleImport(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  // ⚠️ Confirm destructive replace
  const ok = confirm(
    'Importing will DELETE ALL current jobs and replace them with the file contents. Continue?'
  );
  if (!ok) {
    input.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const text = String(reader.result || '');
      await jobStore.importFromRaw(text);
      input.value = ''; // allow re-import of same file later
      alert('Import completed successfully.');
    } catch (err) {
      console.error('Import failed:', err);
      alert('Import failed. Make sure this is a valid JSON export from this app.');
      input.value = '';
    }
  };
  reader.readAsText(file, 'utf-8');
}

// defaults for quick reuse
const DEFAULTS = {
  status: 'All' as 'All' | JobApplication['status'],
  company: ALL_COMPANIES as string,
  sortKey: 'date' as 'date' | 'company' | 'position',
  sortDir: 'desc' as 'asc' | 'desc',
};

// Are filters already at defaults?
const isDefaultFilters = computed(() =>
  selectedStatus.value === DEFAULTS.status &&
  selectedCompany.value === DEFAULTS.company &&
  sortKey.value === DEFAULTS.sortKey &&
  sortDir.value === DEFAULTS.sortDir
);

// Reset handler
function resetFilters() {
  selectedStatus.value = DEFAULTS.status;
  selectedCompany.value = DEFAULTS.company;
  sortKey.value = DEFAULTS.sortKey;
  sortDir.value = DEFAULTS.sortDir;
}

// --- duplicate detection (unchanged logic) ---
const normalizeUrl = (u?: string) => (u ?? '').trim();
const hasDuplicates = computed(() => {
  const counts: Record<string, number> = {};
  for (const j of jobStore.jobs) {
    if (!j.url) continue;
    const key = normalizeUrl(j.url);
    if (!key) continue;
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.values(counts).some((n) => n > 1);
});

// --- companies list for dropdown (unique, sorted) ---
const companies = computed<string[]>(() => {
  const set = new Set<string>();
  for (const j of jobStore.jobs) {
    const c = (j.company ?? '').trim();
    if (c) set.add(c);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
});

// --- main computed: filter + sort ---
const filteredAndSortedJobs = computed<JobApplication[]>(() => {
  // defensive copy
  let result = jobStore.jobs.slice();

  // status filter
  if (selectedStatus.value !== 'All') {
    result = result.filter((j) => j.status === selectedStatus.value);
  }

  // company filter
  if (selectedCompany.value !== ALL_COMPANIES) {
    const target = (selectedCompany.value ?? '').trim();
    result = result.filter((j) => (j.company ?? '').trim() === target);
  }

  // sorting
  result.sort((a, b) => {
    let cmp = 0;
    if (sortKey.value === 'date') {
      // prefer createdAt; fallback to parsed dateApplied; final fallback = 0
      const aTime =
        typeof a.createdAt === 'number'
          ? a.createdAt
          : (Number.isFinite(Date.parse(a.dateApplied)) ? new Date(a.dateApplied).getTime() : 0);
      const bTime =
        typeof b.createdAt === 'number'
          ? b.createdAt
          : (Number.isFinite(Date.parse(b.dateApplied)) ? new Date(b.dateApplied).getTime() : 0);
      cmp = aTime - bTime;
    } else if (sortKey.value === 'company') {
      cmp = (a.company ?? '').localeCompare(b.company ?? '');
    } else {
      cmp = (a.position ?? '').localeCompare(b.position ?? '');
    }
    return sortDir.value === 'asc' ? cmp : -cmp;
  });

  return result;
});
</script>
