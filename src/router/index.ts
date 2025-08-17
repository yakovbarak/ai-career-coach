import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/Home.vue';
import JobTracker from '../pages/JobTracker.vue';
import ResumeHelper from '../pages/ResumeHelper.vue';
import InterviewPrep from '../pages/InterviewPrep.vue';
import StudyPlanner from '../pages/StudyPlanner.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/jobs', component: JobTracker },
  { path: '/resume', component: ResumeHelper },
  { path: '/interview', component: InterviewPrep },
  { path: '/study', component: StudyPlanner },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;