import { setActivePinia, createPinia } from 'pinia';
import { useJobStore } from '../src/store/JobStore';
import type { JobApplication } from '../src/types/job';

const STORAGE_KEY = 'jobtracker_jobs_v1';

describe('Job store smoke test', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    // isolate localStorage per test
    localStorage.clear();
  });

  it('adds, updates, removes, and persists a job', async () => {
    const store = useJobStore();

    // start empty
    expect(store.jobs.length).toBe(0);

    const job: JobApplication = {
      id: 'test-1',
      company: 'Acme',
      position: 'Senior SWE',
      status: 'Applied',
      dateApplied: '2025-08-20',
      url: 'https://example.com/job',
      createdAt: Date.now(),
    };

    await store.addJob(job);
    expect(store.jobs.length).toBe(1);

    // persisted in localStorage
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    expect(Array.isArray(saved)).toBe(true);
    expect(saved[0].company).toBe('Acme');

    await store.updateJob('test-1', { status: 'Interview' });
    expect(store.jobs[0].status).toBe('Interview');

    await store.removeJob('test-1');
    expect(store.jobs.length).toBe(0);
  });
});