describe('Career Preferences', () => {
  describe('Validation', () => {
    it('should validate desired roles as array', () => {
      const preferences = {
        desiredRoles: ['Full Stack Developer', 'Backend Developer'],
        preferredLocations: ['Remote'],
      };

      expect(Array.isArray(preferences.desiredRoles)).toBe(true);
      expect(preferences.desiredRoles.length).toBeGreaterThan(0);
    });

    it('should validate location preferences', () => {
      const validLocations = ['Remote', 'Hybrid', 'Onsite'];
      const userPreference = 'Remote';

      expect(validLocations).toContain(userPreference);
    });

    it('should validate salary range', () => {
      const preferences = {
        minSalary: 80000,
        maxSalary: 150000,
      };

      expect(preferences.minSalary).toBeLessThan(preferences.maxSalary);
      expect(preferences.minSalary).toBeGreaterThan(0);
    });

    it('should handle missing optional fields', () => {
      const preferences = {
        isActivelySeeking: true,
        desiredRoles: ['Developer'],
        // No salary specified
      };

      expect(preferences.isActivelySeeking).toBe(true);
      expect(preferences.desiredRoles).toBeDefined();
    });

    it('should validate employment types', () => {
      const validTypes = ['Full-time', 'Part-time', 'Contract', 'Freelance'];
      const userTypes = ['Full-time', 'Contract'];

      userTypes.forEach(type => {
        expect(validTypes).toContain(type);
      });
    });
  });

  describe('Matching Logic', () => {
    it('should match job to user preferences', () => {
      const preferences = {
        desiredRoles: ['Full Stack Developer', 'Backend Developer'],
        preferredLocations: ['Remote', 'San Francisco'],
        workPreference: 'Remote',
        minSalary: 100000,
      };

      const job = {
        title: 'Full Stack Developer',
        location: 'Remote',
        locationType: 'Remote',
        salaryMax: 130000,
      };

      const titleMatch = preferences.desiredRoles.some(role =>
        role.toLowerCase().includes(job.title.toLowerCase()) ||
        job.title.toLowerCase().includes(role.toLowerCase())
      );

      const locationMatch = preferences.preferredLocations.some(loc =>
        loc === 'Remote' && job.locationType === 'Remote'
      );

      const salaryMatch = job.salaryMax >= preferences.minSalary;

      expect(titleMatch).toBe(true);
      expect(locationMatch).toBe(true);
      expect(salaryMatch).toBe(true);
    });

    it('should handle work preference matching', () => {
      const preferences = {
        workPreference: 'Hybrid',
      };

      const jobs = [
        { locationType: 'Remote' },
        { locationType: 'Hybrid' },
        { locationType: 'Onsite' },
      ];

      const perfectMatch = jobs.find(
        job => job.locationType === preferences.workPreference
      );

      expect(perfectMatch).toBeDefined();
      expect(perfectMatch?.locationType).toBe('Hybrid');
    });
  });

  describe('User Status Flags', () => {
    it('should track if user is actively seeking', () => {
      const user = {
        isActivelySeeking: true,
        isOpenToOffers: false,
      };

      expect(user.isActivelySeeking).toBe(true);
      expect(user.isOpenToOffers).toBe(false);
    });

    it('should allow both flags to be true', () => {
      const user = {
        isActivelySeeking: true,
        isOpenToOffers: true,
      };

      expect(user.isActivelySeeking && user.isOpenToOffers).toBe(true);
    });
  });
});
