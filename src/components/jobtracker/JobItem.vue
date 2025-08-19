<template>
  <div :class="['p-4 border rounded transition-colors', rowClass]">
    <div class="flex justify-between items-start gap-4">
      <!-- Content -->
      <div class="flex-1">
        <!-- View Mode -->
        <div v-if="!editing">
          <h2 class="font-semibold">{{ currentJob.position }} @ {{ currentJob.company }}</h2>
          <p class="text-sm text-gray-600">
            Status: {{ currentJob.status }} | Applied: {{ currentJob.dateApplied }}
          </p>
          <p v-if="currentJob.url" class="text-sm mt-1">
            <a :href="currentJob.url" target="_blank" class="text-blue-600 underline">
              {{ currentJob.url }}
            </a>
          </p>
          <p v-if="currentJob.notes" class="text-sm mt-1">Notes: {{ currentJob.notes }}</p>
          <p v-if="currentJob.jobDescription" class="text-sm mt-1 whitespace-pre-wrap">
            {{ currentJob.jobDescription }}
          </p>
          <div v-if="currentJob.recruiter && (currentJob.recruiter.name || currentJob.recruiter.email || currentJob.recruiter.phone)"
              class="text-sm mt-1">
            <span class="font-semibold">Recruiter:</span>
            <span v-if="currentJob.recruiter.name"> {{ currentJob.recruiter.name }}</span>
            <span v-if="currentJob.recruiter.email"> · {{ currentJob.recruiter.email }}</span>
            <span v-if="currentJob.recruiter.phone"> · {{ currentJob.recruiter.phone }}</span>
          </div>

        </div>

        <!-- Edit Mode -->
        <div v-else class="space-y-2">
          <input v-model="editCompany" placeholder="Company" class="input" />
          <input v-model="editPosition" placeholder="Position" class="input" />
          <select v-model="editStatus" class="input">
            <option>Applied</option>
            <option>Interview</option>
            <option>Offer</option>
            <option>Rejected</option>
          </select>
          <input v-model="editUrl" placeholder="Job URL" class="input" />
          <textarea v-model="editNotes" placeholder="Notes" class="input"></textarea>
          <textarea v-model="editJobDescription" placeholder="Job description" class="input"></textarea>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input v-model="editRecruiterName"  placeholder="Recruiter name"  class="input" />
            <input v-model="editRecruiterEmail" placeholder="Recruiter email" class="input" />
            <input v-model="editRecruiterPhone" placeholder="Recruiter phone" class="input" />
          </div>
          <div class="flex gap-2 pt-1">
            <button @click="save" class="bg-green-600 text-white px-3 py-1 rounded">
              Save
            </button>
            <button @click="cancelEdit" class="bg-gray-400 text-white px-3 py-1 rounded">
              Cancel
            </button>
          </div>
        </div>
      </div>

      <!-- Actions (View Mode only) -->
      <div v-if="!editing" class="flex flex-col gap-2">
        <button @click="startEdit" class="text-blue-600 hover:underline">Edit</button>
        <button @click="jobStore.removeJob(currentJob.id)" class="text-red-600 hover:underline">
          Remove
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { JobApplication } from '../../types/job';
import { useJobStore } from '../../store/JobStore';

const props = defineProps<{ job: JobApplication }>();
const jobStore = useJobStore();

/**
 * Source of truth is the store. We derive the "currentJob" from the store by ID.
 * This guarantees the row's background only reflects SAVED state,
 * not transient edits in the form.
 */
const currentJob = computed(() =>
  jobStore.jobs.find(j => j.id === props.job.id) ?? props.job
);

const editing = ref(false);
const editCompany = ref(currentJob.value.company);
const editPosition = ref(currentJob.value.position);
const editStatus = ref<JobApplication['status']>(currentJob.value.status);
const editNotes = ref(currentJob.value.notes ?? '');
const editUrl = ref(currentJob.value.url ?? '');
const editJobDescription = ref(currentJob.value.jobDescription ?? '');
const editRecruiterName = ref(currentJob.value.recruiter?.name ?? '');
const editRecruiterEmail = ref(currentJob.value.recruiter?.email ?? '');
const editRecruiterPhone = ref(currentJob.value.recruiter?.phone ?? '');

function startEdit() {
  editing.value = true;
  // load fresh values from the store (in case it changed)
  editCompany.value = currentJob.value.company;
  editPosition.value = currentJob.value.position;
  editStatus.value = currentJob.value.status;
  editNotes.value = currentJob.value.notes ?? '';
  editUrl.value = currentJob.value.url ?? '';
  editJobDescription.value = currentJob.value.jobDescription ?? '';
  editRecruiterName.value = currentJob.value.recruiter?.name ?? '';
  editRecruiterEmail.value = currentJob.value.recruiter?.email ?? '';
  editRecruiterPhone.value = currentJob.value.recruiter?.phone ?? '';
}

function cancelEdit() {
  editing.value = false;
  // reset fields to saved state
  editCompany.value = currentJob.value.company;
  editPosition.value = currentJob.value.position;
  editStatus.value = currentJob.value.status;
  editNotes.value = currentJob.value.notes ?? '';
  editUrl.value = currentJob.value.url ?? '';
  editJobDescription.value = currentJob.value.jobDescription ?? '';
  editRecruiterName.value = currentJob.value.recruiter?.name ?? '';
  editRecruiterEmail.value = currentJob.value.recruiter?.email ?? '';
  editRecruiterPhone.value = currentJob.value.recruiter?.phone ?? '';
}

function save() {
  jobStore.updateJob(currentJob.value.id, {
    company: editCompany.value,
    position: editPosition.value,
    status: editStatus.value,
    notes: editNotes.value || undefined,
    url: editUrl.value.trim() || undefined,
    jobDescription: editJobDescription.value || undefined,
    recruiter: {
      name:  editRecruiterName.value  || undefined,
      email: editRecruiterEmail.value || undefined,
      phone: editRecruiterPhone.value || undefined,
    },
  });
  editing.value = false;
}

// --- Duplicate detection (uses SAVED data only) ---
const normalizeUrl = (u?: string) => (u ?? '').trim();
const isDuplicate = computed(() => {
  const url = normalizeUrl(currentJob.value.url);
  if (!url) return false;
  let count = 0;
  for (const j of jobStore.jobs) {
    if (normalizeUrl(j.url) === url) count++;
  }
  return count > 1;
});

// --- Background priority: Rejected (red) > Duplicate (yellow) > Normal (white) ---
const rowClass = computed(() => {
  if (currentJob.value.status === 'Rejected') return 'bg-red-300';
  if (isDuplicate.value) return 'bg-yellow-200';
  return 'bg-white';
});
</script>

<style scoped>
.input {
  @apply border rounded px-2 py-1 w-full;
}
</style>
