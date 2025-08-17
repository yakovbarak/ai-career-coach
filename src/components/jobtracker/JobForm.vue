<template>
  <form @submit.prevent="handleSubmit" class="mb-6 space-y-3">
    <input v-model="company" placeholder="Company" class="input" required />
    <input v-model="position" placeholder="Position" class="input" required />
    <select v-model="status" class="input">
      <option>Applied</option>
      <option>Interview</option>
      <option>Offer</option>
      <option>Rejected</option>
    </select>
    <textarea v-model="notes" placeholder="Notes" class="input"></textarea>
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

function handleSubmit() {
  jobStore.addJob({
    id: uuidv4(),
    company: company.value,
    position: position.value,
    status: status.value,
    dateApplied: new Date().toISOString().split('T')[0],
    notes: notes.value,
  });

  company.value = '';
  position.value = '';
  status.value = 'Applied';
  notes.value = '';
}
</script>

<style scoped>
.input {
  @apply border rounded px-3 py-2 w-full;
}
</style>