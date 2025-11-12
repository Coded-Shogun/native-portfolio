import { calculateJobMatch, generateImprovementSuggestions, findBestMatches } from '../../utils/jobMatching';

describe('Job Matching Algorithm', () => {
  describe('calculateJobMatch', () => {
    const mockPortfolio = {
      skills: [
        { name: 'JavaScript', proficiency: 90 },
        { name: 'React', proficiency: 85 },
        { name: 'Node.js', proficiency: 80 },
        { name: 'TypeScript', proficiency: 75 },
        { name: 'PostgreSQL', proficiency: 70 },
      ],
      workHistory: [
        {
          position: 'Full Stack Developer',
          company: 'Tech Corp',
        },
        {
          position: 'Frontend Developer',
          company: 'StartupCo',
        },
      ],
      certifications: [
        {
          name: 'AWS Certified Developer',
          issuer: 'Amazon',
        },
      ],
      careerPreferences: {
        desiredRoles: ['Full Stack Developer', 'Senior Developer'],
        preferredLocations: ['Remote', 'San Francisco'],
        workPreference: 'Remote',
        minSalary: 100000,
      },
    };

    const mockJob = {
      title: 'Full Stack Developer',
      requiredSkills: ['JavaScript', 'React', 'Node.js', 'Docker', 'AWS'],
      location: 'San Francisco',
      locationType: 'Remote',
      salaryMin: 110000,
      salaryMax: 150000,
      experienceLevel: 'Mid',
    };

    it('should calculate a high match score for well-matched job', () => {
      const result = calculateJobMatch(mockPortfolio as any, mockJob as any);

      expect(result.matchScore).toBeGreaterThan(70);
      expect(result.matchScore).toBeLessThanOrEqual(100);
    });

    it('should identify matched skills correctly', () => {
      const result = calculateJobMatch(mockPortfolio as any, mockJob as any);

      expect(result.matchReasons).toContain(
        expect.stringContaining('required skills matched')
      );
    });

    it('should identify missing skills', () => {
      const result = calculateJobMatch(mockPortfolio as any, mockJob as any);

      expect(result.missingSkills).toContain('Docker');
      expect(result.missingSkills.length).toBeGreaterThan(0);
    });

    it('should give bonus for relevant work experience', () => {
      const result = calculateJobMatch(mockPortfolio as any, mockJob as any);

      expect(result.matchReasons).toContain('Relevant work experience');
    });

    it('should match location preferences', () => {
      const result = calculateJobMatch(mockPortfolio as any, mockJob as any);

      expect(result.matchReasons).toContain(
        expect.stringMatching(/Location preference match|Remote/)
      );
    });

    it('should match salary expectations', () => {
      const result = calculateJobMatch(mockPortfolio as any, mockJob as any);

      expect(result.matchReasons).toContain(
        expect.stringMatching(/salary/)
      );
    });

    it('should give bonus for relevant certifications', () => {
      const result = calculateJobMatch(mockPortfolio as any, mockJob as any);

      expect(result.matchReasons).toContain(
        expect.stringContaining('certification')
      );
    });

    it('should return 0 match score for completely mismatched job', () => {
      const mismatchedJob = {
        title: 'Data Scientist',
        requiredSkills: ['Python', 'Machine Learning', 'TensorFlow', 'Pandas'],
        location: 'New York',
        locationType: 'Onsite',
        salaryMin: 80000,
        salaryMax: 90000,
      };

      const result = calculateJobMatch(mockPortfolio as any, mismatchedJob as any);

      expect(result.matchScore).toBeLessThan(50);
      expect(result.missingSkills.length).toBeGreaterThan(3);
    });

    it('should handle portfolio with no skills', () => {
      const emptyPortfolio = {
        skills: [],
        workHistory: [],
        certifications: [],
      };

      const result = calculateJobMatch(emptyPortfolio as any, mockJob as any);

      expect(result.matchScore).toBeGreaterThanOrEqual(0);
      expect(result.matchScore).toBeLessThan(30);
    });

    it('should handle remote job preference correctly', () => {
      const remotePortfolio = {
        ...mockPortfolio,
        careerPreferences: {
          ...mockPortfolio.careerPreferences,
          preferredLocations: ['Remote'],
          workPreference: 'Remote',
        },
      };

      const remoteJob = {
        ...mockJob,
        locationType: 'Remote',
      };

      const result = calculateJobMatch(remotePortfolio as any, remoteJob as any);

      expect(result.matchReasons).toContain(
        expect.stringMatching(/Remote|Location/)
      );
    });

    it('should penalize salary below expectations', () => {
      const lowSalaryJob = {
        ...mockJob,
        salaryMax: 80000, // Below minimum expectation of 100k
      };

      const result = calculateJobMatch(mockPortfolio as any, lowSalaryJob as any);

      expect(result.matchReasons).toContain('Below salary expectations');
    });

    it('should identify strength areas', () => {
      const result = calculateJobMatch(mockPortfolio as any, mockJob as any);

      expect(result.strengthAreas.length).toBeGreaterThan(0);
      expect(result.strengthAreas).toContain(
        expect.stringMatching(/Expert|experience/)
      );
    });
  });

  describe('generateImprovementSuggestions', () => {
    it('should suggest learning missing skills', () => {
      const matchResult = {
        matchScore: 65,
        matchReasons: [],
        missingSkills: ['Docker', 'Kubernetes', 'GraphQL'],
        strengthAreas: [],
      };

      const portfolio = {
        skills: [{ name: 'JavaScript', proficiency: 80 }],
        workHistory: [{ position: 'Developer', company: 'Tech' }],
        certifications: [],
      };

      const job = {
        title: 'DevOps Engineer',
        requiredSkills: ['Docker', 'Kubernetes'],
        location: 'Remote',
        locationType: 'Remote',
      };

      const suggestions = generateImprovementSuggestions(
        matchResult,
        portfolio as any,
        job as any
      );

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0]).toContain('Docker');
    });

    it('should suggest setting career preferences if missing', () => {
      const matchResult = {
        matchScore: 70,
        matchReasons: [],
        missingSkills: [],
        strengthAreas: [],
      };

      const portfolio = {
        skills: [{ name: 'JavaScript', proficiency: 80 }],
        workHistory: [],
        certifications: [],
        // No careerPreferences
      };

      const job = {
        title: 'Developer',
        requiredSkills: ['JavaScript'],
        location: 'Remote',
        locationType: 'Remote',
      };

      const suggestions = generateImprovementSuggestions(
        matchResult,
        portfolio as any,
        job as any
      );

      expect(suggestions).toContain(
        expect.stringContaining('career preferences')
      );
    });

    it('should suggest adding work history if empty', () => {
      const matchResult = {
        matchScore: 60,
        matchReasons: [],
        missingSkills: [],
        strengthAreas: [],
      };

      const portfolio = {
        skills: [{ name: 'JavaScript', proficiency: 80 }],
        workHistory: [],
        certifications: [],
      };

      const job = {
        title: 'Developer',
        requiredSkills: ['JavaScript'],
        location: 'Remote',
        locationType: 'Remote',
      };

      const suggestions = generateImprovementSuggestions(
        matchResult,
        portfolio as any,
        job as any
      );

      expect(suggestions).toContain(
        expect.stringContaining('work history')
      );
    });
  });

  describe('findBestMatches', () => {
    const mockPortfolio = {
      skills: [
        { name: 'JavaScript', proficiency: 90 },
        { name: 'React', proficiency: 85 },
      ],
      workHistory: [],
      certifications: [],
      careerPreferences: {
        desiredRoles: ['Developer'],
        preferredLocations: ['Remote'],
        workPreference: 'Remote',
      },
    };

    const mockJobs = [
      {
        title: 'Senior React Developer',
        requiredSkills: ['JavaScript', 'React', 'TypeScript'],
        location: 'Remote',
        locationType: 'Remote',
      },
      {
        title: 'Full Stack Developer',
        requiredSkills: ['JavaScript', 'React', 'Node.js'],
        location: 'Remote',
        locationType: 'Remote',
      },
      {
        title: 'Data Scientist',
        requiredSkills: ['Python', 'Machine Learning'],
        location: 'Remote',
        locationType: 'Remote',
      },
    ];

    it('should return jobs sorted by match score', async () => {
      const matches = await findBestMatches(
        mockPortfolio as any,
        mockJobs as any,
        50
      );

      expect(matches.length).toBeGreaterThan(0);

      // Check that matches are sorted descending
      for (let i = 0; i < matches.length - 1; i++) {
        expect(matches[i].match.matchScore).toBeGreaterThanOrEqual(
          matches[i + 1].match.matchScore
        );
      }
    });

    it('should filter jobs below minimum score', async () => {
      const matches = await findBestMatches(
        mockPortfolio as any,
        mockJobs as any,
        80 // High minimum score
      );

      // All returned matches should be >= 80
      matches.forEach(match => {
        expect(match.match.matchScore).toBeGreaterThanOrEqual(80);
      });
    });

    it('should return empty array if no jobs meet minimum score', async () => {
      const matches = await findBestMatches(
        mockPortfolio as any,
        mockJobs as any,
        99 // Very high minimum score
      );

      expect(matches).toEqual([]);
    });
  });
});
