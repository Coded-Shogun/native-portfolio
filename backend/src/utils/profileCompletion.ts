interface Portfolio {
  title?: string | null;
  bio?: string | null;
  profileImage?: string | null;
  phone?: string | null;
  location?: string | null;
  projects: any[];
  certifications: any[];
  workHistory: any[];
  achievements: any[];
  skills: any[];
}

export const calculateProfileCompletion = (portfolio: Portfolio): number => {
  let score = 0;
  const weights = {
    basicInfo: 20,      // title, bio, profile image
    contact: 10,        // phone, location
    projects: 25,       // at least 2 projects
    workHistory: 20,    // at least 1 work experience
    skills: 10,         // at least 3 skills
    certifications: 10, // at least 1 certification
    achievements: 5,    // at least 1 achievement
  };

  // Basic Info (20%)
  if (portfolio.title && portfolio.bio && portfolio.profileImage) {
    score += weights.basicInfo;
  } else if ((portfolio.title && portfolio.bio) || (portfolio.title && portfolio.profileImage)) {
    score += weights.basicInfo * 0.6;
  } else if (portfolio.title || portfolio.bio || portfolio.profileImage) {
    score += weights.basicInfo * 0.3;
  }

  // Contact Info (10%)
  if (portfolio.phone && portfolio.location) {
    score += weights.contact;
  } else if (portfolio.phone || portfolio.location) {
    score += weights.contact * 0.5;
  }

  // Projects (25%)
  if (portfolio.projects.length >= 3) {
    score += weights.projects;
  } else if (portfolio.projects.length >= 2) {
    score += weights.projects * 0.7;
  } else if (portfolio.projects.length >= 1) {
    score += weights.projects * 0.4;
  }

  // Work History (20%)
  if (portfolio.workHistory.length >= 2) {
    score += weights.workHistory;
  } else if (portfolio.workHistory.length >= 1) {
    score += weights.workHistory * 0.7;
  }

  // Skills (10%)
  if (portfolio.skills.length >= 5) {
    score += weights.skills;
  } else if (portfolio.skills.length >= 3) {
    score += weights.skills * 0.7;
  } else if (portfolio.skills.length >= 1) {
    score += weights.skills * 0.4;
  }

  // Certifications (10%)
  if (portfolio.certifications.length >= 2) {
    score += weights.certifications;
  } else if (portfolio.certifications.length >= 1) {
    score += weights.certifications * 0.7;
  }

  // Achievements (5%)
  if (portfolio.achievements.length >= 1) {
    score += weights.achievements;
  }

  return Math.round(score);
};
