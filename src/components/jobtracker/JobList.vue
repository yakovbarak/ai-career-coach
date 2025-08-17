<template>
  <div class="space-y-3">
    <JobItem v-for="job in jobStore.jobs" :key="job.id" :job="job" />
  </div>
</template>

<script setup lang="ts">
import { useJobStore } from '../../store/JobStore';
import JobItem from './JobItem.vue';

const jobStore = useJobStore();
</script>