import { create } from 'zustand';
import { mockJobs, mockProposals } from '../db/schema';

const useJobStore = create((set, get) => ({
  jobs: mockJobs,
  proposals: mockProposals,
  filters: {
    category: null,
    budgetMin: 0,
    budgetMax: 25000,
    skills: [],
    urgentOnly: false
  },
  
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),
  
  getFilteredJobs: () => {
    const { jobs, filters } = get();
    const normalizedJobs = jobs.map((job) => {
      if (job.isFeatured && job.featuredUntil && new Date(job.featuredUntil) <= new Date()) {
        return {
          ...job,
          isFeatured: false,
          featuredUntil: null
        };
      }
      return job;
    });

    return normalizedJobs.filter(job => {
      if (filters.urgentOnly && !job.isUrgent) return false;
      if (filters.category && job.category !== filters.category) return false;
      if (job.budgetMax < filters.budgetMin || job.budgetMin > filters.budgetMax) return false;
      if (filters.skills.length > 0) {
        const hasSkill = filters.skills.some(skill => 
          job.requiredSkills.includes(skill)
        );
        if (!hasSkill) return false;
      }
      return true;
    });
  },
  
  addProposal: (proposal) => set((state) => ({
    proposals: [...state.proposals, proposal]
  })),

  fetchJobs: async () => {
    try {
      const response = await fetch('/api/jobs');
      const result = await response.json();
      if (!response.ok || !result.success) {
        return;
      }

      set({ jobs: result.jobs || [] });
    } catch (error) {
    }
  },

  fetchProposals: async () => {
    try {
      const response = await fetch('/api/proposals');
      const result = await response.json();
      if (!response.ok || !result.success) {
        return;
      }

      set({ proposals: result.proposals || [] });
    } catch (error) {
    }
  },

  createJob: async (jobPayload) => {
    const response = await fetch('/api/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jobPayload)
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Unable to create job.');
    }

    set((state) => ({ jobs: [result.job, ...state.jobs] }));
    return result.job;
  },

  createProposal: async (proposalPayload) => {
    const response = await fetch('/api/proposals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(proposalPayload)
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Unable to submit proposal.');
    }

    set((state) => ({ proposals: [result.proposal, ...state.proposals] }));
    return result.proposal;
  },
  
  addJob: (job) => set((state) => ({
    jobs: [...state.jobs, job]
  })),

  promoteJobToFeatured: (jobId, featuredDays = 3) => set((state) => ({
    jobs: state.jobs.map((job) =>
      job.id === jobId
        ? {
            ...job,
            isFeatured: true,
            featuredUntil: new Date(Date.now() + featuredDays * 86400000).toISOString()
          }
        : job
    )
  })),

  cleanupExpiredFeaturedJobs: () => set((state) => ({
    jobs: state.jobs.map((job) =>
      job.isFeatured && job.featuredUntil && new Date(job.featuredUntil) <= new Date()
        ? {
            ...job,
            isFeatured: false,
            featuredUntil: null
          }
        : job
    )
  }))
}));

export default useJobStore;
