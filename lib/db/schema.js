// Database Schema Definitions for Nainix Marketplace
// Mock data structure following Prisma-like schema

import { v4 as uuidv4 } from 'uuid';

// User Schema
export const UserRole = {
  CLIENT: 'CLIENT',
  FREELANCER: 'FREELANCER'
};

export const UserPlan = {
  FREE: 'FREE',
  AI_PRO: 'AI_PRO'
};

// Job Status
export const JobStatus = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED'
};

// Job Categories
export const JobCategory = {
  WEB_DEV: 'Web Development',
  APP_DEV: 'App Development',
  AI_ML: 'AI/ML',
  BLOCKCHAIN: 'Blockchain',
  DEVOPS: 'DevOps',
  BACKEND: 'Backend Development',
  FRONTEND: 'Frontend Development'
};

// Mock Users
export const mockUsers = [];

// Mock Jobs
export const mockJobs = [];

// Mock Proposals
export const mockProposals = [];

// Mock Collab Rooms
export const mockCollabRooms = [];

// Mock Success Stories for Live Ticker
export const mockSuccessStories = [
  { text: '🚀 Welcome to Nainix — The Developer-First Marketplace' },
  { text: '⚡ Your real-time dashboard is ready — Create your first job now!' }
];
