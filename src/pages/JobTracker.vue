<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Job Tracker</h1>
    <JobForm />
    <JobList />
  </div>
</template>

<script setup lang="ts">
import JobForm from '../components/jobtracker/JobForm.vue';
import JobList from '../components/jobtracker/JobList.vue';
</script>