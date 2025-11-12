import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { calculateJobMatch, generateImprovementSuggestions } from '../utils/jobMatching';

// Get personalized job recommendations
export const getJobRecommendations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { limit = '10', minScore = '60' } = req.query;

    // Get user's portfolio with preferences
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
      include: {
        skills: true,
        workHistory: true,
        certifications: true,
        careerPreferences: true,
      },
    });

    if (!portfolio) {
      res.status(404).json({ error: 'Portfolio not found' });
      return;
    }

    // Get active jobs
    const jobs = await prisma.job.findMany({
      where: { isActive: true },
      include: {
        recruiter: {
          select: {
            companyName: true,
            companyWebsite: true,
          },
        },
      },
      take: 50, // Get more to filter
      orderBy: { createdAt: 'desc' },
    });

    // Calculate matches
    const matches = await Promise.all(
      jobs.map(async (job) => {
        const match = calculateJobMatch(portfolio as any, job as any);

        if (match.matchScore >= parseInt(minScore as string)) {
          // Create or update match record
          await prisma.jobMatch.upsert({
            where: {
              jobId_portfolioId: {
                jobId: job.id,
                portfolioId: portfolio.id,
              },
            },
            create: {
              jobId: job.id,
              portfolioId: portfolio.id,
              matchScore: match.matchScore,
              matchReasons: match.matchReasons,
              missingSkills: match.missingSkills,
            },
            update: {
              matchScore: match.matchScore,
              matchReasons: match.matchReasons,
              missingSkills: match.missingSkills,
            },
          });

          return {
            job: {
              ...job,
              _matchScore: match.matchScore,
            },
            matchScore: match.matchScore,
            matchReasons: match.matchReasons,
            missingSkills: match.missingSkills,
            strengthAreas: match.strengthAreas,
            improvementSuggestions: generateImprovementSuggestions(match, portfolio as any, job as any),
          };
        }
        return null;
      })
    );

    const validMatches = matches
      .filter(m => m !== null)
      .sort((a, b) => b!.matchScore - a!.matchScore)
      .slice(0, parseInt(limit as string));

    res.json({
      matches: validMatches,
      total: validMatches.length,
      hasCareerPreferences: !!portfolio.careerPreferences,
    });
  } catch (error) {
    console.error('Get job recommendations error:', error);
    res.status(500).json({ error: 'Failed to get job recommendations' });
  }
};

// Apply to a job
export const applyToJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { jobId } = req.params;
    const { coverLetter, resumeUrl } = req.body;

    // Get portfolio snapshot
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
      include: {
        skills: true,
        workHistory: true,
        certifications: true,
        projects: true,
      },
    });

    if (!portfolio) {
      res.status(404).json({ error: 'Portfolio not found' });
      return;
    }

    // Check if already applied
    const existingApplication = await prisma.jobApplication.findUnique({
      where: {
        jobId_userId: {
          jobId,
          userId,
        },
      },
    });

    if (existingApplication) {
      res.status(400).json({ error: 'You have already applied to this job' });
      return;
    }

    // Create application
    const application = await prisma.jobApplication.create({
      data: {
        jobId,
        userId,
        coverLetter,
        resumeUrl,
        portfolioSnapshot: JSON.stringify(portfolio),
        status: 'submitted',
      },
      include: {
        job: {
          include: {
            recruiter: {
              select: {
                companyName: true,
              },
            },
          },
        },
      },
    });

    // Update job application count
    await prisma.job.update({
      where: { id: jobId },
      data: {
        applicationCount: {
          increment: 1,
        },
      },
    });

    res.status(201).json({
      message: 'Application submitted successfully!',
      application,
    });
  } catch (error) {
    console.error('Apply to job error:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
};

// Get user's applications
export const getMyApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { status } = req.query;

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const applications = await prisma.jobApplication.findMany({
      where,
      include: {
        job: {
          include: {
            recruiter: {
              select: {
                companyName: true,
                companyWebsite: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate stats
    const stats = {
      total: applications.length,
      submitted: applications.filter(a => a.status === 'submitted').length,
      reviewing: applications.filter(a => a.status === 'reviewing').length,
      interview: applications.filter(a => a.status === 'interview').length,
      offer: applications.filter(a => a.status === 'offer').length,
      rejected: applications.filter(a => a.status === 'rejected').length,
      accepted: applications.filter(a => a.status === 'accepted').length,
    };

    res.json({
      applications,
      stats,
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

// Update application status and notes
export const updateApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { status, notes, interviewDate, interviewStage } = req.body;

    // Verify ownership
    const application = await prisma.jobApplication.findFirst({
      where: { id, userId },
    });

    if (!application) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    const updateData: any = { notes };

    if (status) {
      updateData.status = status;
      updateData.statusUpdatedAt = new Date();

      // Update specific fields based on status
      if (status === 'rejected') {
        updateData.rejectedAt = new Date();
      } else if (status === 'offer') {
        updateData.offerReceivedAt = new Date();
      } else if (status === 'accepted') {
        updateData.acceptedAt = new Date();
      }
    }

    if (interviewDate) {
      updateData.interviewDate = new Date(interviewDate);
    }

    if (interviewStage) {
      updateData.interviewStage = interviewStage;
    }

    const updatedApplication = await prisma.jobApplication.update({
      where: { id },
      data: updateData,
      include: {
        job: true,
      },
    });

    res.json({
      message: 'Application updated',
      application: updatedApplication,
    });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
};

// Save a job for later
export const saveJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { jobId } = req.params;
    const { notes } = req.body;

    const savedJob = await prisma.savedJob.upsert({
      where: {
        jobId_userId: {
          jobId,
          userId,
        },
      },
      create: {
        jobId,
        userId,
        notes,
      },
      update: {
        notes,
      },
    });

    res.json({
      message: 'Job saved',
      savedJob,
    });
  } catch (error) {
    console.error('Save job error:', error);
    res.status(500).json({ error: 'Failed to save job' });
  }
};

// Get saved jobs
export const getSavedJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const savedJobs = await prisma.savedJob.findMany({
      where: { userId },
      include: {
        job: {
          include: {
            recruiter: {
              select: {
                companyName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ savedJobs });
  } catch (error) {
    console.error('Get saved jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch saved jobs' });
  }
};

// Remove saved job
export const removeSavedJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { jobId } = req.params;

    await prisma.savedJob.delete({
      where: {
        jobId_userId: {
          jobId,
          userId,
        },
      },
    });

    res.json({ message: 'Job removed from saved' });
  } catch (error) {
    console.error('Remove saved job error:', error);
    res.status(500).json({ error: 'Failed to remove saved job' });
  }
};

// Browse all jobs (with filters)
export const browseJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      search,
      location,
      locationType,
      employmentType,
      salaryMin,
      experienceLevel,
      page = '1',
      limit = '20',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { isActive: true };

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { companyName: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (location) {
      where.location = { contains: location as string, mode: 'insensitive' };
    }

    if (locationType) {
      where.locationType = locationType;
    }

    if (employmentType) {
      where.employmentType = employmentType;
    }

    if (salaryMin) {
      where.salaryMax = { gte: parseInt(salaryMin as string) };
    }

    if (experienceLevel) {
      where.experienceLevel = experienceLevel;
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          recruiter: {
            select: {
              companyName: true,
              companyWebsite: true,
              industry: true,
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.job.count({ where }),
    ]);

    res.json({
      jobs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Browse jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

// Get single job details
export const getJobDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        recruiter: {
          select: {
            companyName: true,
            companyWebsite: true,
            companySize: true,
            industry: true,
            bio: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    // Check if user has applied
    let hasApplied = false;
    let isSaved = false;
    let matchScore = null;

    if (userId) {
      const application = await prisma.jobApplication.findUnique({
        where: {
          jobId_userId: {
            jobId: id,
            userId,
          },
        },
      });
      hasApplied = !!application;

      const savedJob = await prisma.savedJob.findUnique({
        where: {
          jobId_userId: {
            jobId: id,
            userId,
          },
        },
      });
      isSaved = !!savedJob;

      // Get match score if exists
      const portfolio = await prisma.portfolio.findUnique({
        where: { userId },
      });

      if (portfolio) {
        const match = await prisma.jobMatch.findUnique({
          where: {
            jobId_portfolioId: {
              jobId: id,
              portfolioId: portfolio.id,
            },
          },
        });
        matchScore = match;
      }
    }

    // Increment view count
    await prisma.job.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    res.json({
      job,
      hasApplied,
      isSaved,
      matchScore,
    });
  } catch (error) {
    console.error('Get job details error:', error);
    res.status(500).json({ error: 'Failed to fetch job details' });
  }
};
