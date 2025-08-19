export interface JobApplication {
  id: string;          // unique ID
  company: string;     
  position: string;    
  status: 'Applied' | 'Interview' | 'Offer' | 'Rejected';
  dateApplied: string; // ISO date string
  notes?: string;      // optional extra info
  url?: string;
  createdAt?: number;

  jobDescription?: string;
  recruiter?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}