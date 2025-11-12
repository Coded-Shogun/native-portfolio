import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { calculateJobMatch, generateImprovementSuggestions } from '../utils/jobMatching';
import { logError, logInfo, logWarning, logAudit } from '../utils/logger';

/**
 * ENTERPRISE-GRADE JOBS CONTROLLER
 *
 * Performance improvements:
 * - CRITICAL FIX: Eliminated N+1 query problem with batch upserts
 * - Uses Prisma transactions for atomicity
 * - Proper structured logging instead of console.log
 * - Audit logging for job applications
 * - Input validation and sanitization
 * - Proper error handling without information leakage
 */

// Get personalized job recommendations
export const getJobRecommendations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { limit = '10', minScore = '60' } = req.query;

    const limitNum = Math.min(parseInt(limit as string) || 10, 100); // Max 100 to prevent abuse
    const minScoreNum = parseInt(minScore as string) || 60;

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
      logWarning('Job recommendations requested without portfolio', {
        userId,
        ip: req.ip,
      });

      res.status(404).json({
        error: 'Portfolio not found',
        message: 'Please complete your profile before viewing job recommendations',
      });
      return;
    }

    if (!portfolio.careerPreferences) {
      logInfo('Job recommendations requested without career preferences', {
        userId,
        portfolioId: portfolio.id,
      });

      res.status(400).json({
        error: 'Career preferences not set',
        message: 'Please set your career preferences to get personalized job matches',
      });
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
      take: 50, // Limit to prevent excessive processing
      orderBy: { createdAt: 'desc' },
    });

    if (jobs.length === 0) {
      res.json({
        matches: [],
        total: 0,
        message: 'No active jobs available at the moment',
      });
      return;
    }

    // Calculate all matches (no database calls yet)
    const calculatedMatches = jobs
      .map((job) => {
        const match = calculateJobMatch(portfolio as any, job as any);

        if (match.matchScore >= minScoreNum) {
          return {
            job,
            match,
            portfolioId: portfolio.id,
          };
        }
        return null;
      })
      .filter((m) => m !== null);

    // CRITICAL FIX: Batch upsert all matches in a single transaction
    // This eliminates the N+1 query problem!
    if (calculatedMatches.length > 0) {
      try {
        await prisma.$transaction(
          calculatedMatches.map(({ job, match, portfolioId }) =>
            prisma.jobMatch.upsert({
              where: {
                jobId_portfolioId: {
                  jobId: job.id,
                  portfolioId: portfolioId!,
                },
              },
              create: {
                jobId: job.id,
                portfolioId: portfolioId!,
                matchScore: match.matchScore,
                matchReasons: match.matchReasons,
                missingSkills: match.missingSkills,
              },
              update: {
                matchScore: match.matchScore,
                matchReasons: match.matchReasons,
                missingSkills: match.missingSkills,
                updatedAt: new Date(),
              },
            })
          )
        );

        logInfo('Job matches calculated and stored', {
          userId,
          portfolioId: portfolio.id,
          totalJobs: jobs.length,
          matchesFound: calculatedMatches.length,
          minScore: minScoreNum,
        });
      } catch (batchError) {
        // Log error but don't fail the request
        // We can still return calculated matches even if storage fails
        logError('Failed to store job matches', batchError as Error, {
          userId,
          portfolioId: portfolio.id,
          matchesCount: calculatedMatches.length,
        });
      }
    }

    // Sort and limit results
    const sortedMatches = calculatedMatches
      .sort((a, b) => b!.match.matchScore - a!.match.matchScore)
      .slice(0, limitNum);

    // Format response
    const formattedMatches = sortedMatches.map(({ job, match }) => ({
      job: {
        id: job.id,
        title: job.title,
        company: job.recruiter?.companyName || 'Unknown',
        companyWebsite: job.recruiter?.companyWebsite,
        location: job.location,
        locationType: job.locationType,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        description: job.description,
        requiredSkills: job.requiredSkills,
        experienceLevel: job.experienceLevel,
        createdAt: job.createdAt,
      },
      matchScore: match.matchScore,
      matchReasons: match.matchReasons,
      missingSkills: match.missingSkills,
      strengthAreas: match.strengthAreas,
      improvementSuggestions: generateImprovementSuggestions(match, portfolio as any, job as any),
    }));

    res.json({
      matches: formattedMatches,
      total: formattedMatches.length,
      stats: {
        excellentMatches: formattedMatches.filter((m) => m.matchScore >= 90).length,
        goodMatches: formattedMatches.filter((m) => m.matchScore >= 75 && m.matchScore < 90).length,
        fairMatches: formattedMatches.filter((m) => m.matchScore >= 60 && m.matchScore < 75).length,
      },
    });
  } catch (error) {
    logError('Get job recommendations error', error as Error, {
      userId: req.userId,
      ip: req.ip,
    });

    res.status(500).json({
      error: 'Failed to get job recommendations',
      message: 'An error occurred while calculating job matches. Please try again later.',
    });
  }
};

// Apply to a job
export const applyToJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { jobId } = req.params;
    const { coverLetter, notes } = req.body;

    // Get portfolio
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      res.status(404).json({
        error: 'Portfolio not found',
        message: 'Please complete your profile before applying to jobs',
      });
      return;
    }

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      res.status(404).json({
        error: 'Job not found',
      });
      return;
    }

    if (!job.isActive) {
      res.status(400).json({
        error: 'Job is no longer active',
        message: 'This job posting has been closed',
      });
      return;
    }

    // Check if already applied
    const existingApplication = await prisma.jobApplication.findUnique({
      where: {
        jobId_portfolioId: {
          jobId,
          portfolioId: portfolio.id,
        },
      },
    });

    if (existingApplication) {
      res.status(409).json({
        error: 'Already applied',
        message: 'You have already applied to this job',
        application: {
          appliedAt: existingApplication.appliedAt,
          status: existingApplication.status,
        },
      });
      return;
    }

    // Create application
    const application = await prisma.jobApplication.create({
      data: {
        jobId,
        portfolioId: portfolio.id,
        coverLetter: coverLetter || null,
        notes: notes || null,
        status: 'submitted',
      },
      include: {
        job: {
          select: {
            title: true,
            company: true,
          },
        },
      },
    });

    // Audit log the application
    logAudit('job_application_submitted', userId, {
      jobId,
      jobTitle: job.title,
      portfolioId: portfolio.id,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    logInfo('Job application submitted', {
      userId,
      jobId,
      portfolioId: portfolio.id,
      applicationId: application.id,
    });

    res.status(201).json({
      message: 'Application submitted successfully',
      application: {
        id: application.id,
        jobTitle: application.job.title,
        company: application.job.company,
        appliedAt: application.appliedAt,
        status: application.status,
      },
    });
  } catch (error) {
    logError('Apply to job error', error as Error, {
      userId: req.userId,
      jobId: req.params.jobId,
      ip: req.ip,
    });

    res.status(500).json({
      error: 'Failed to submit application',
      message: 'An error occurred while submitting your application. Please try again later.',
    });
  }
};

// Get user's applications
export const getMyApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { status, limit = '50', offset = '0' } = req.query;

    const limitNum = Math.min(parseInt(limit as string) || 50, 100);
    const offsetNum = parseInt(offset as string) || 0;

    // Get portfolio
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      res.status(404).json({
        error: 'Portfolio not found',
      });
      return;
    }

    // Build filter
    const where: any = {
      portfolioId: portfolio.id,
    };

    if (status && typeof status === 'string') {
      where.status = status;
    }

    // Get applications with pagination
    const [applications, total] = await Promise.all([
      prisma.jobApplication.findMany({
        where,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              company: true,
              location: true,
              locationType: true,
              salaryMin: true,
              salaryMax: true,
            },
          },
        },
        orderBy: { appliedAt: 'desc' },
        take: limitNum,
        skip: offsetNum,
      }),
      prisma.jobApplication.count({ where }),
    ]);

    // Calculate statistics
    const stats = await prisma.jobApplication.groupBy({
      by: ['status'],
      where: { portfolioId: portfolio.id },
      _count: true,
    });

    const statsMap = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      applications: applications.map((app) => ({
        id: app.id,
        job: app.job,
        status: app.status,
        appliedAt: app.appliedAt,
        updatedAt: app.updatedAt,
        notes: app.notes,
      })),
      pagination: {
        total,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < total,
      },
      stats: {
        total,
        submitted: statsMap['submitted'] || 0,
        reviewing: statsMap['reviewing'] || 0,
        interview: statsMap['interview'] || 0,
        assessment: statsMap['assessment'] || 0,
        offer: statsMap['offer'] || 0,
        accepted: statsMap['accepted'] || 0,
        rejected: statsMap['rejected'] || 0,
      },
    });
  } catch (error) {
    logError('Get my applications error', error as Error, {
      userId: req.userId,
      ip: req.ip,
    });

    res.status(500).json({
      error: 'Failed to get applications',
    });
  }
};

// Update application status
export const updateApplicationStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { applicationId } = req.params;
    const { status, notes } = req.body;

    // Validate status
    const validStatuses = [
      'submitted',
      'reviewing',
      'interview',
      'assessment',
      'offer',
      'accepted',
      'rejected',
      'declined',
    ];

    if (!validStatuses.includes(status)) {
      res.status(400).json({
        error: 'Invalid status',
        validStatuses,
      });
      return;
    }

    // Get portfolio
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      res.status(404).json({
        error: 'Portfolio not found',
      });
      return;
    }

    // Get application and verify ownership
    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          select: {
            title: true,
            company: true,
          },
        },
      },
    });

    if (!application) {
      res.status(404).json({
        error: 'Application not found',
      });
      return;
    }

    if (application.portfolioId !== portfolio.id) {
      logWarning('Unauthorized application update attempt', {
        userId,
        applicationId,
        portfolioId: portfolio.id,
        applicationPortfolioId: application.portfolioId,
        ip: req.ip,
      });

      res.status(403).json({
        error: 'Unauthorized',
        message: 'You do not have permission to update this application',
      });
      return;
    }

    // Update application
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const updatedApplication = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: updateData,
    });

    // Audit log status change
    logAudit('job_application_status_updated', userId, {
      applicationId,
      jobTitle: application.job.title,
      oldStatus: application.status,
      newStatus: status,
      ip: req.ip,
    });

    logInfo('Application status updated', {
      userId,
      applicationId,
      oldStatus: application.status,
      newStatus: status,
    });

    res.json({
      message: 'Application updated successfully',
      application: {
        id: updatedApplication.id,
        status: updatedApplication.status,
        updatedAt: updatedApplication.updatedAt,
      },
    });
  } catch (error) {
    logError('Update application status error', error as Error, {
      userId: req.userId,
      applicationId: req.params.applicationId,
      ip: req.ip,
    });

    res.status(500).json({
      error: 'Failed to update application',
    });
  }
};

// Save a job for later
export const saveJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { jobId } = req.params;

    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      res.status(404).json({
        error: 'Portfolio not found',
      });
      return;
    }

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      res.status(404).json({
        error: 'Job not found',
      });
      return;
    }

    // Check if already saved
    const existing = await prisma.savedJob.findUnique({
      where: {
        jobId_portfolioId: {
          jobId,
          portfolioId: portfolio.id,
        },
      },
    });

    if (existing) {
      res.status(409).json({
        error: 'Job already saved',
      });
      return;
    }

    // Save job
    await prisma.savedJob.create({
      data: {
        jobId,
        portfolioId: portfolio.id,
      },
    });

    logInfo('Job saved', {
      userId,
      jobId,
      portfolioId: portfolio.id,
    });

    res.status(201).json({
      message: 'Job saved successfully',
    });
  } catch (error) {
    logError('Save job error', error as Error, {
      userId: req.userId,
      jobId: req.params.jobId,
      ip: req.ip,
    });

    res.status(500).json({
      error: 'Failed to save job',
    });
  }
};

// Get saved jobs
export const getSavedJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      res.status(404).json({
        error: 'Portfolio not found',
      });
      return;
    }

    const savedJobs = await prisma.savedJob.findMany({
      where: { portfolioId: portfolio.id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
            locationType: true,
            salaryMin: true,
            salaryMax: true,
            description: true,
            requiredSkills: true,
            createdAt: true,
            isActive: true,
          },
        },
      },
      orderBy: { savedAt: 'desc' },
    });

    res.json({
      savedJobs: savedJobs.map((saved) => ({
        id: saved.id,
        job: saved.job,
        savedAt: saved.savedAt,
      })),
      total: savedJobs.length,
    });
  } catch (error) {
    logError('Get saved jobs error', error as Error, {
      userId: req.userId,
      ip: req.ip,
    });

    res.status(500).json({
      error: 'Failed to get saved jobs',
    });
  }
};

// Remove saved job
export const removeSavedJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { jobId } = req.params;

    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      res.status(404).json({
        error: 'Portfolio not found',
      });
      return;
    }

    const deleted = await prisma.savedJob.deleteMany({
      where: {
        jobId,
        portfolioId: portfolio.id,
      },
    });

    if (deleted.count === 0) {
      res.status(404).json({
        error: 'Saved job not found',
      });
      return;
    }

    logInfo('Saved job removed', {
      userId,
      jobId,
      portfolioId: portfolio.id,
    });

    res.json({
      message: 'Saved job removed successfully',
    });
  } catch (error) {
    logError('Remove saved job error', error as Error, {
      userId: req.userId,
      jobId: req.params.jobId,
      ip: req.ip,
    });

    res.status(500).json({
      error: 'Failed to remove saved job',
    });
  }
};
