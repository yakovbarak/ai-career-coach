import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import JobList from '../src/components/jobtracker/JobList.vue';
import { useJobStore } from '../src/store/JobStore';

it('renders JobList with items', async () => {
  const pinia = createTestingPinia({ stubActions: false });
  const wrapper = mount(JobList, { global: { plugins: [pinia] } });

  const store = useJobStore();
  await store.addJob({
    id: '1',
    company: 'Globex',
    position: 'Staff Engineer',
    status: 'Applied',
    dateApplied: '2025-08-20',
    createdAt: Date.now(),
    url: 'https://example.com/1'
  });

  // basic smoke: one item rendered
  expect(wrapper.html()).toContain('Globex');
});
