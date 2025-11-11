import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { calculateProfileCompletion } from '../utils/profileCompletion';

export const getMyPortfolio = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
      include: {
        projects: { orderBy: { order: 'asc' } },
        certifications: { orderBy: { order: 'asc' } },
        workHistory: { orderBy: { order: 'asc' } },
        achievements: { orderBy: { order: 'asc' } },
        skills: { orderBy: { order: 'asc' } },
      },
    });

    if (!portfolio) {
      res.status(404).json({ error: 'Portfolio not found' });
      return;
    }

    res.json({ portfolio });
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
};

export const updatePortfolio = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const {
      title,
      tagline,
      bio,
      profileImage,
      coverImage,
      phone,
      location,
      website,
      linkedinUrl,
      githubUrl,
      twitterUrl,
      isPublic,
      isSearchable,
    } = req.body;

    // Get current portfolio to calculate completion
    const currentPortfolio = await prisma.portfolio.findUnique({
      where: { userId },
      include: {
        projects: true,
        certifications: true,
        workHistory: true,
        achievements: true,
        skills: true,
      },
    });

    if (!currentPortfolio) {
      res.status(404).json({ error: 'Portfolio not found' });
      return;
    }

    // Update portfolio
    const updatedPortfolio = await prisma.portfolio.update({
      where: { userId },
      data: {
        title,
        tagline,
        bio,
        profileImage,
        coverImage,
        phone,
        location,
        website,
        linkedinUrl,
        githubUrl,
        twitterUrl,
        isPublic,
        isSearchable,
      },
    });

    // Recalculate completion score
    const portfolioWithRelations = await prisma.portfolio.findUnique({
      where: { userId },
      include: {
        projects: true,
        certifications: true,
        workHistory: true,
        achievements: true,
        skills: true,
      },
    });

    if (portfolioWithRelations) {
      const completionScore = calculateProfileCompletion(portfolioWithRelations);
      await prisma.portfolio.update({
        where: { userId },
        data: { completionScore },
      });
    }

    res.json({
      message: 'Portfolio updated successfully',
      portfolio: updatedPortfolio
    });
  } catch (error) {
    console.error('Update portfolio error:', error);
    res.status(500).json({ error: 'Failed to update portfolio' });
  }
};

export const getPortfolioStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
      include: {
        projects: true,
        certifications: true,
        workHistory: true,
        achievements: true,
        skills: true,
      },
    });

    if (!portfolio) {
      res.status(404).json({ error: 'Portfolio not found' });
      return;
    }

    const stats = {
      completionScore: portfolio.completionScore,
      projectCount: portfolio.projects.length,
      certificationCount: portfolio.certifications.length,
      workHistoryCount: portfolio.workHistory.length,
      achievementCount: portfolio.achievements.length,
      skillCount: portfolio.skills.length,
      isPublic: portfolio.isPublic,
      isSearchable: portfolio.isSearchable,
      shareableUrl: `${process.env.FRONTEND_URL}/portfolio/${portfolio.slug}`,
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get portfolio stats error:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio stats' });
  }
};
