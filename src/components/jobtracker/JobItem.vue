<template>
  <div class="p-4 border rounded flex justify-between items-center">
    <!-- Edit Mode -->
    <div v-if="isEditing" class="flex-1 space-y-2">
      <input v-model="editCompany" class="input" />
      <input v-model="editPosition" class="input" />
      <select v-model="editStatus" class="input">
        <option>Applied</option>
        <option>Interview</option>
        <option>Offer</option>
        <option>Rejected</option>
      </select>
      <textarea v-model="editNotes" class="input"></textarea>
      <div class="flex gap-2 mt-2">
        <button @click="saveEdit" class="bg-green-600 text-white px-3 py-1 rounded">
          Save
        </button>
        <button @click="cancelEdit" class="bg-gray-400 text-white px-3 py-1 rounded">
          Cancel
        </button>
      </div>
    </div>

    <!-- View Mode -->
    <div v-else class="flex-1">
      <h2 class="font-semibold">{{ job.position }} @ {{ job.company }}</h2>
      <p class="text-sm text-gray-500">
        Status: {{ job.status }} | Applied: {{ job.dateApplied }}
      </p>
      <p v-if="job.notes" class="text-sm mt-1">Notes: {{ job.notes }}</p>
    </div>

    <!-- Action Buttons -->
    <div class="ml-4 flex flex-col gap-2">
      <button v-if="!isEditing" @click="startEdit" class="text-blue-500 hover:underline">
        Edit
      </button>
      <button @click="jobStore.removeJob(job.id)" class="text-red-500 hover:underline">
        Remove
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useJobStore } from '../../store/JobStore';
import type { JobApplication } from '../../types/job';

const props = defineProps<{ job: JobApplication }>();
const jobStore = useJobStore();

const isEditing = ref(false);
const editCompany = ref(props.job.company);
const editPosition = ref(props.job.position);
const editStatus = ref(props.job.status);
const editNotes = ref(props.job.notes ?? '');

function startEdit() {
  isEditing.value = true;
}

function cancelEdit() {
  isEditing.value = false;
  editCompany.value = props.job.company;
  editPosition.value = props.job.position;
  editStatus.value = props.job.status;
  editNotes.value = props.job.notes ?? '';
}

function saveEdit() {
  jobStore.updateJob({
    ...props.job,
    company: editCompany.value,
    position: editPosition.value,
    status: editStatus.value,
    notes: editNotes.value,
  });
  isEditing.value = false;
}
</script>

<style scoped>
.input {
  @apply border rounded px-2 py-1 w-full;
}
</style>