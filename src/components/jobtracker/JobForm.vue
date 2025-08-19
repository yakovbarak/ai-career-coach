<template>
  <form @submit.prevent="handleSubmit" class="mb-6 space-y-3">
    <input v-model="company" placeholder="Company" class="input" required />
    <input v-model="position" placeholder="Position" class="input" required />
    <input v-model="url" placeholder="Job URL (optional)" class="input" />
    <select v-model="status" class="input">
      <option>Applied</option>
      <option>Interview</option>
      <option>Offer</option>
      <option>Rejected</option>
    </select>
    <textarea v-model="notes" placeholder="Notes" class="input"></textarea>
    <textarea v-model="jobDescription" placeholder="Job description (optional)" class="input"></textarea>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
      <input v-model="recruiterName"  placeholder="Recruiter name (optional)"  class="input" />
      <input v-model="recruiterEmail" placeholder="Recruiter email (optional)" class="input" />
      <input v-model="recruiterPhone" placeholder="Recruiter phone (optional)" class="input" />
    </div>

    <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">
      Add Job
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useJobStore } from '../../store/JobStore';
import { v4 as uuidv4 } from 'uuid';

const jobStore = useJobStore();

const company = ref('');
const position = ref('');
const status = ref<'Applied' | 'Interview' | 'Offer' | 'Rejected'>('Applied');
const notes = ref('');
const url = ref('');
const jobDescription = ref('');
const recruiterName = ref('');
const recruiterEmail = ref('');
const recruiterPhone = ref('');

function handleSubmit() {
  jobStore.addJob({
    id: uuidv4(),
    company: company.value,
    position: position.value,
    status: status.value,
    dateApplied: new Date().toISOString().split('T')[0],
    notes: notes.value || undefined,
    url: url.value.trim() || undefined,
    createdAt: Date.now(),
    jobDescription: jobDescription.value || undefined,
    recruiter: {
      name: recruiterName.value || undefined,
      email: recruiterEmail.value || undefined,
      phone: recruiterPhone.value || undefined,
    },
  });

  // reset:
  company.value = '';
  position.value = '';
  status.value = 'Applied';
  notes.value = '';
  url.value = '';
  jobDescription.value = '';
  recruiterName.value = '';
  recruiterEmail.value = '';
  recruiterPhone.value = '';
}
</script>

<style scoped>
.input {
  @apply border rounded px-3 py-2 w-full;
}
</style>