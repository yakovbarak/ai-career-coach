// src/services/storage.ts
import type { JobApplication } from '../types/job';

export interface JobStorage {
  list(): Promise<JobApplication[]>;
  add(job: JobApplication): Promise<void>;
  update(id: string, patch: Partial<JobApplication>): Promise<void>;
  remove(id: string): Promise<void>;
  clear?(): Promise<void>; // optional
}
