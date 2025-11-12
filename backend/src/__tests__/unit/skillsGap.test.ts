// Mock data for testing skills gap analysis

export const mockRoleSkillsDatabase = {
  'full stack developer': [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express',
    'PostgreSQL', 'MongoDB', 'REST API', 'Git', 'Docker'
  ],
  'data scientist': [
    'Python', 'Machine Learning', 'TensorFlow', 'Pandas',
    'NumPy', 'Statistics', 'SQL', 'Jupyter'
  ],
};

describe('Skills Gap Analysis', () => {
  describe('Role Skills Database', () => {
    it('should have predefined skills for common roles', () => {
      expect(mockRoleSkillsDatabase['full stack developer']).toBeDefined();
      expect(mockRoleSkillsDatabase['full stack developer'].length).toBeGreaterThan(5);
    });

    it('should identify missing skills correctly', () => {
      const currentSkills = ['JavaScript', 'React', 'Node.js'];
      const requiredSkills = mockRoleSkillsDatabase['full stack developer'];

      const missingSkills = requiredSkills.filter(
        required => !currentSkills.some(current =>
          current.toLowerCase() === required.toLowerCase()
        )
      );

      expect(missingSkills).toContain('TypeScript');
      expect(missingSkills).toContain('Docker');
      expect(missingSkills.length).toBeGreaterThan(0);
    });

    it('should calculate readiness score accurately', () => {
      const currentSkills = ['JavaScript', 'React', 'Node.js', 'Express', 'Git'];
      const requiredSkills = mockRoleSkillsDatabase['full stack developer'];

      const matchedCount = requiredSkills.filter(required =>
        currentSkills.some(current =>
          current.toLowerCase() === required.toLowerCase()
        )
      ).length;

      const readinessScore = Math.round((matchedCount / requiredSkills.length) * 100);

      expect(readinessScore).toBeGreaterThan(0);
      expect(readinessScore).toBeLessThanOrEqual(100);
      expect(readinessScore).toBe(50); // 5 out of 10 skills
    });

    it('should prioritize most critical missing skills', () => {
      const currentSkills = ['JavaScript', 'HTML', 'CSS'];
      const requiredSkills = mockRoleSkillsDatabase['full stack developer'];

      const missingSkills = requiredSkills.filter(
        required => !currentSkills.some(current =>
          current.toLowerCase() === required.toLowerCase()
        )
      );

      const prioritySkills = missingSkills.slice(0, 3);

      expect(prioritySkills.length).toBeLessThanOrEqual(3);
      expect(prioritySkills.length).toBeGreaterThan(0);
    });

    it('should estimate learning time based on skill count', () => {
      const missingSkills = ['Docker', 'Kubernetes', 'GraphQL', 'TypeScript'];
      const estimatedMonths = Math.ceil(missingSkills.length * 1.5);

      expect(estimatedMonths).toBe(6); // 4 skills * 1.5 months
      expect(estimatedMonths).toBeGreaterThan(0);
    });

    it('should handle case-insensitive skill matching', () => {
      const currentSkills = ['javascript', 'REACT', 'Node.JS'];
      const requiredSkills = ['JavaScript', 'React', 'Node.js'];

      const matchedCount = requiredSkills.filter(required =>
        currentSkills.some(current =>
          current.toLowerCase() === required.toLowerCase()
        )
      ).length;

      expect(matchedCount).toBe(3);
    });

    it('should identify skills to improve (low proficiency)', () => {
      const skills = [
        { name: 'JavaScript', proficiency: 90 },
        { name: 'React', proficiency: 45 },
        { name: 'Node.js', proficiency: 30 },
      ];

      const skillsToImprove = skills
        .filter(s => s.proficiency < 70)
        .map(s => s.name);

      expect(skillsToImprove).toContain('React');
      expect(skillsToImprove).toContain('Node.js');
      expect(skillsToImprove).not.toContain('JavaScript');
    });
  });

  describe('Learning Recommendations', () => {
    it('should provide learning resources for missing skills', () => {
      const mockLearningResources: Record<string, string[]> = {
        'JavaScript': ['FreeCodeCamp', 'JavaScript.info'],
        'React': ['React Docs', 'Udemy React Course'],
        'Docker': ['Docker Official Docs', 'Docker Mastery'],
      };

      const missingSkills = ['JavaScript', 'React'];
      const recommendations: string[] = [];

      missingSkills.forEach(skill => {
        if (mockLearningResources[skill]) {
          recommendations.push(...mockLearningResources[skill]);
        }
      });

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations).toContain('FreeCodeCamp');
      expect(recommendations).toContain('React Docs');
    });

    it('should limit learning path recommendations', () => {
      const allRecommendations = [
        'Course 1', 'Course 2', 'Course 3',
        'Course 4', 'Course 5', 'Course 6'
      ];

      const limitedRecommendations = allRecommendations.slice(0, 5);

      expect(limitedRecommendations.length).toBe(5);
      expect(limitedRecommendations.length).toBeLessThanOrEqual(5);
    });

    it('should suggest certifications for relevant skills', () => {
      const missingSkills = ['AWS', 'Docker', 'Python'];
      const certificationMap: Record<string, string> = {
        'AWS': 'AWS Certified Solutions Architect',
        'Docker': 'Docker Certified Associate',
        'Kubernetes': 'Certified Kubernetes Administrator',
      };

      const suggestedCerts = missingSkills
        .filter(skill => certificationMap[skill])
        .map(skill => certificationMap[skill]);

      expect(suggestedCerts).toContain('AWS Certified Solutions Architect');
      expect(suggestedCerts).toContain('Docker Certified Associate');
    });
  });

  describe('Career Readiness Calculation', () => {
    it('should calculate 100% readiness when all skills match', () => {
      const currentSkills = ['JavaScript', 'React', 'Node.js'];
      const requiredSkills = ['JavaScript', 'React', 'Node.js'];

      const readiness = Math.round(
        (currentSkills.length / requiredSkills.length) * 100
      );

      expect(readiness).toBe(100);
    });

    it('should calculate 0% readiness when no skills match', () => {
      const currentSkills = ['Python', 'Django'];
      const requiredSkills = ['JavaScript', 'React', 'Node.js'];

      const matchedCount = requiredSkills.filter(required =>
        currentSkills.includes(required)
      ).length;

      const readiness = Math.round((matchedCount / requiredSkills.length) * 100);

      expect(readiness).toBe(0);
    });

    it('should provide motivational message based on readiness', () => {
      const getMotivationalMessage = (score: number): string => {
        if (score >= 80) return "You're almost there! Just a few more skills to master.";
        if (score >= 60) return "Great progress! You're more than halfway there.";
        if (score >= 40) return "Keep going! You're building momentum.";
        return "You're just getting started. Focus on the priority skills.";
      };

      expect(getMotivationalMessage(85)).toContain("almost there");
      expect(getMotivationalMessage(65)).toContain("halfway");
      expect(getMotivationalMessage(45)).toContain("momentum");
      expect(getMotivationalMessage(20)).toContain("getting started");
    });
  });
});
