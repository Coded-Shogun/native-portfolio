export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isEmailVerified: boolean;
  portfolioSlug?: string;
}

export interface Portfolio {
  id: string;
  slug: string;
  title?: string | null;
  tagline?: string | null;
  bio?: string | null;
  profileImage?: string | null;
  coverImage?: string | null;
  phone?: string | null;
  location?: string | null;
  website?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  twitterUrl?: string | null;
  isPublic: boolean;
  isSearchable: boolean;
  completionScore: number;
  projects: Project[];
  certifications: Certification[];
  workHistory: WorkHistory[];
  achievements: Achievement[];
  skills: Skill[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  role?: string | null;
  imageUrl?: string | null;
  projectUrl?: string | null;
  githubUrl?: string | null;
  technologies: string[];
  startDate?: string | null;
  endDate?: string | null;
  isFeatured: boolean;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string | null;
  credentialId?: string | null;
  credentialUrl?: string | null;
  imageUrl?: string | null;
  description?: string | null;
}

export interface WorkHistory {
  id: string;
  company: string;
  position: string;
  location?: string | null;
  employmentType?: string | null;
  startDate: string;
  endDate?: string | null;
  isCurrentJob: boolean;
  description?: string | null;
  achievements: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  category?: string | null;
  issuer?: string | null;
  imageUrl?: string | null;
}

export interface Skill {
  id: string;
  name: string;
  category?: string | null;
  proficiency: number;
}
