// Job Matching Algorithm - AI-Powered
// Calculates match score between a professional's portfolio and a job posting

interface MatchResult {
  matchScore: number;
  matchReasons: string[];
  missingSkills: string[];
  strengthAreas: string[];
}

interface Portfolio {
  skills: Array<{ name: string; proficiency: number }>;
  workHistory: Array<{ position: string; company: string }>;
  certifications: Array<{ name: string; issuer: string }>;
  careerPreferences?: {
    desiredRoles: string[];
    preferredLocations: string[];
    workPreference: string;
    minSalary?: number;
  };
}

interface Job {
  title: string;
  requiredSkills: string[];
  location: string;
  locationType: string;
  salaryMin?: number;
  salaryMax?: number;
  experienceLevel?: string;
}

export function calculateJobMatch(portfolio: Portfolio, job: Job): MatchResult {
  let totalScore = 0;
  const matchReasons: string[] = [];
  const missingSkills: string[] = [];
  const strengthAreas: string[] = [];

  // 1. SKILLS MATCH (40 points max)
  const portfolioSkills = portfolio.skills.map(s => s.name.toLowerCase());
  const requiredSkills = job.requiredSkills.map(s => s.toLowerCase());

  let skillsMatched = 0;
  let skillsScore = 0;

  requiredSkills.forEach(requiredSkill => {
    const matchedSkill = portfolio.skills.find(
      ps => ps.name.toLowerCase().includes(requiredSkill) ||
            requiredSkill.includes(ps.name.toLowerCase())
    );

    if (matchedSkill) {
      skillsMatched++;
      // Weight by proficiency
      const proficiencyBonus = matchedSkill.proficiency / 100;
      skillsScore += (40 / requiredSkills.length) * proficiencyBonus;

      if (matchedSkill.proficiency >= 80) {
        strengthAreas.push(`Expert in ${matchedSkill.name}`);
      }
    } else {
      missingSkills.push(requiredSkill);
    }
  });

  totalScore += skillsScore;

  if (skillsMatched > 0) {
    matchReasons.push(
      `${skillsMatched}/${requiredSkills.length} required skills matched`
    );
  }

  // 2. JOB TITLE MATCH (20 points max)
  const jobTitle = job.title.toLowerCase();
  const hasRelevantExperience = portfolio.workHistory.some(work => {
    const position = work.position.toLowerCase();
    const titleWords = jobTitle.split(' ').filter(w => w.length > 3);
    return titleWords.some(word => position.includes(word));
  });

  if (hasRelevantExperience) {
    totalScore += 20;
    matchReasons.push('Relevant work experience');
    strengthAreas.push('Previous experience in similar role');
  } else if (portfolio.careerPreferences?.desiredRoles) {
    const desiredMatch = portfolio.careerPreferences.desiredRoles.some(role =>
      role.toLowerCase().includes(jobTitle) || jobTitle.includes(role.toLowerCase())
    );
    if (desiredMatch) {
      totalScore += 10;
      matchReasons.push('Matches career goals');
    }
  }

  // 3. LOCATION PREFERENCE (15 points max)
  if (portfolio.careerPreferences?.preferredLocations) {
    const jobLocation = job.location.toLowerCase();
    const locationMatch = portfolio.careerPreferences.preferredLocations.some(loc =>
      loc.toLowerCase() === jobLocation ||
      loc.toLowerCase() === 'remote' && job.locationType === 'Remote' ||
      jobLocation.includes(loc.toLowerCase())
    );

    if (locationMatch) {
      totalScore += 15;
      matchReasons.push('Location preference match');
    } else if (job.locationType === 'Remote') {
      totalScore += 10;
      matchReasons.push('Remote opportunity available');
    }
  } else if (job.locationType === 'Remote') {
    totalScore += 10;
  }

  // 4. WORK TYPE PREFERENCE (10 points max)
  if (portfolio.careerPreferences?.workPreference) {
    if (portfolio.careerPreferences.workPreference === job.locationType) {
      totalScore += 10;
      matchReasons.push('Work type preference match');
    } else if (job.locationType === 'Hybrid' && portfolio.careerPreferences.workPreference !== 'Onsite') {
      totalScore += 5;
    }
  }

  // 5. SALARY MATCH (10 points max)
  if (portfolio.careerPreferences?.minSalary && job.salaryMax) {
    if (job.salaryMax >= portfolio.careerPreferences.minSalary) {
      totalScore += 10;
      if (job.salaryMax >= portfolio.careerPreferences.minSalary * 1.2) {
        matchReasons.push('Exceeds salary expectations');
        strengthAreas.push('Above expected compensation');
      } else {
        matchReasons.push('Meets salary expectations');
      }
    } else {
      matchReasons.push('Below salary expectations');
      totalScore -= 5; // Penalty
    }
  }

  // 6. CERTIFICATIONS BONUS (5 points max)
  if (portfolio.certifications && portfolio.certifications.length > 0) {
    const relevantCerts = portfolio.certifications.filter(cert => {
      const certName = cert.name.toLowerCase();
      return requiredSkills.some(skill =>
        certName.includes(skill) || skill.includes(certName)
      ) || jobTitle.split(' ').some(word => certName.includes(word));
    });

    if (relevantCerts.length > 0) {
      totalScore += Math.min(5, relevantCerts.length * 2);
      matchReasons.push(`${relevantCerts.length} relevant certification(s)`);
      strengthAreas.push('Certified professional');
    }
  }

  // Ensure score is between 0-100
  totalScore = Math.max(0, Math.min(100, Math.round(totalScore)));

  return {
    matchScore: totalScore,
    matchReasons,
    missingSkills,
    strengthAreas,
  };
}

// Generate personalized application improvement suggestions
export function generateImprovementSuggestions(
  matchResult: MatchResult,
  portfolio: Portfolio,
  job: Job
): string[] {
  const suggestions: string[] = [];

  // Critical missing skills
  if (matchResult.missingSkills.length > 0) {
    const critical = matchResult.missingSkills.slice(0, 3);
    suggestions.push(
      `Learn these key skills: ${critical.join(', ')} to significantly improve your match score`
    );
  }

  // Profile completion
  if (!portfolio.careerPreferences) {
    suggestions.push(
      'Set your career preferences to get better job matches'
    );
  }

  // Experience level
  if (portfolio.workHistory.length === 0) {
    suggestions.push(
      'Add your work history to showcase your experience'
    );
  }

  // Certifications
  if (portfolio.certifications.length === 0 && matchResult.missingSkills.length > 0) {
    suggestions.push(
      `Consider getting certified in ${matchResult.missingSkills[0]} to stand out`
    );
  }

  // Low proficiency skills
  const lowProficiencySkills = portfolio.skills
    .filter(s => s.proficiency < 50)
    .slice(0, 2);

  if (lowProficiencySkills.length > 0) {
    suggestions.push(
      `Improve proficiency in: ${lowProficiencySkills.map(s => s.name).join(', ')}`
    );
  }

  return suggestions;
}

// Batch match calculation for multiple jobs
export async function findBestMatches(
  portfolio: Portfolio,
  jobs: Job[],
  minScore: number = 50
): Promise<Array<{ job: Job; match: MatchResult }>> {
  const matches = jobs.map(job => ({
    job,
    match: calculateJobMatch(portfolio, job),
  }));

  return matches
    .filter(m => m.match.matchScore >= minScore)
    .sort((a, b) => b.match.matchScore - a.match.matchScore);
}
