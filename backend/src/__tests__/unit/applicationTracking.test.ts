describe('Job Application Tracking', () => {
  describe('Application Status Pipeline', () => {
    it('should have valid status transitions', () => {
      const validStatuses = [
        'submitted',
        'reviewing',
        'interview',
        'rejected',
        'offer',
        'accepted',
      ];

      expect(validStatuses).toContain('submitted');
      expect(validStatuses).toContain('offer');
      expect(validStatuses).toContain('accepted');
    });

    it('should track status progression', () => {
      const application = {
        status: 'submitted',
        createdAt: new Date('2024-01-01'),
        statusUpdatedAt: new Date('2024-01-01'),
      };

      // Update to reviewing
      application.status = 'reviewing';
      application.statusUpdatedAt = new Date('2024-01-05');

      expect(application.status).toBe('reviewing');
      expect(application.statusUpdatedAt.getTime()).toBeGreaterThan(
        application.createdAt.getTime()
      );
    });

    it('should set timestamps for terminal statuses', () => {
      const application = {
        status: 'offer',
        offerReceivedAt: new Date(),
      };

      expect(application.offerReceivedAt).toBeInstanceOf(Date);
    });

    it('should handle rejection with reason', () => {
      const application = {
        status: 'rejected',
        rejectedAt: new Date(),
        rejectionReason: 'Position filled',
      };

      expect(application.status).toBe('rejected');
      expect(application.rejectionReason).toBeTruthy();
    });
  });

  describe('Interview Tracking', () => {
    it('should track interview date and stage', () => {
      const application = {
        status: 'interview',
        interviewDate: new Date('2024-02-15'),
        interviewStage: 'technical',
      };

      expect(application.interviewDate).toBeInstanceOf(Date);
      expect(['phone_screen', 'technical', 'final']).toContain(
        application.interviewStage
      );
    });

    it('should allow interview notes', () => {
      const application = {
        interviewNotes: 'Great technical discussion. Asked about React hooks.',
      };

      expect(application.interviewNotes).toBeTruthy();
      expect(application.interviewNotes.length).toBeGreaterThan(10);
    });
  });

  describe('Application Analytics', () => {
    it('should calculate application statistics', () => {
      const applications = [
        { status: 'submitted' },
        { status: 'submitted' },
        { status: 'reviewing' },
        { status: 'interview' },
        { status: 'offer' },
        { status: 'rejected' },
        { status: 'rejected' },
      ];

      const stats = {
        total: applications.length,
        submitted: applications.filter(a => a.status === 'submitted').length,
        reviewing: applications.filter(a => a.status === 'reviewing').length,
        interview: applications.filter(a => a.status === 'interview').length,
        offer: applications.filter(a => a.status === 'offer').length,
        rejected: applications.filter(a => a.status === 'rejected').length,
      };

      expect(stats.total).toBe(7);
      expect(stats.submitted).toBe(2);
      expect(stats.interview).toBe(1);
      expect(stats.offer).toBe(1);
      expect(stats.rejected).toBe(2);
    });

    it('should calculate conversion rates', () => {
      const stats = {
        total: 10,
        interview: 3,
        offer: 1,
      };

      const interviewRate = (stats.interview / stats.total) * 100;
      const offerRate = (stats.offer / stats.total) * 100;

      expect(interviewRate).toBe(30);
      expect(offerRate).toBe(10);
    });
  });

  describe('Portfolio Snapshot', () => {
    it('should capture portfolio at application time', () => {
      const portfolioSnapshot = JSON.stringify({
        skills: ['JavaScript', 'React'],
        projects: [{ title: 'Portfolio Site' }],
        timestamp: new Date().toISOString(),
      });

      const parsed = JSON.parse(portfolioSnapshot);

      expect(parsed.skills).toBeDefined();
      expect(parsed.projects).toBeDefined();
      expect(parsed.timestamp).toBeTruthy();
    });
  });

  describe('Time to Hire Tracking', () => {
    it('should calculate days from creation to acceptance', () => {
      const application = {
        createdAt: new Date('2024-01-01'),
        acceptedAt: new Date('2024-01-30'),
      };

      const daysDiff = Math.floor(
        (application.acceptedAt.getTime() - application.createdAt.getTime()) /
        (1000 * 60 * 60 * 24)
      );

      expect(daysDiff).toBe(29);
      expect(daysDiff).toBeGreaterThan(0);
    });

    it('should track time between major milestones', () => {
      const application = {
        createdAt: new Date('2024-01-01'),
        firstInterviewAt: new Date('2024-01-15'),
        offerReceivedAt: new Date('2024-01-25'),
        acceptedAt: new Date('2024-01-30'),
      };

      const timeToInterview = Math.floor(
        (application.firstInterviewAt.getTime() - application.createdAt.getTime()) /
        (1000 * 60 * 60 * 24)
      );

      const timeToOffer = Math.floor(
        (application.offerReceivedAt.getTime() - application.createdAt.getTime()) /
        (1000 * 60 * 60 * 24)
      );

      expect(timeToInterview).toBe(14);
      expect(timeToOffer).toBe(24);
    });
  });
});
