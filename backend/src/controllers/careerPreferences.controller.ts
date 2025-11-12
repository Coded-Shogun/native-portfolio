import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

// Get career preferences
export const getCareerPreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
      include: {
        careerPreferences: true,
      },
    });

    if (!portfolio) {
      res.status(404).json({ error: 'Portfolio not found' });
      return;
    }

    res.json({
      preferences: portfolio.careerPreferences,
      hasPreferences: !!portfolio.careerPreferences,
    });
  } catch (error) {
    console.error('Get career preferences error:', error);
    res.status(500).json({ error: 'Failed to fetch career preferences' });
  }
};

// Create or update career preferences
export const saveCareerPreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const {
      isActivelySeeking,
      isOpenToOffers,
      availableFrom,
      desiredRoles,
      desiredIndustries,
      preferredLocations,
      workPreference,
      employmentType,
      minSalary,
      maxSalary,
      currency,
      salaryPeriod,
      careerGoals,
      willingToRelocate,
      needsVisa,
    } = req.body;

    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      res.status(404).json({ error: 'Portfolio not found' });
      return;
    }

    const preferences = await prisma.careerPreferences.upsert({
      where: { portfolioId: portfolio.id },
      create: {
        portfolioId: portfolio.id,
        isActivelySeeking,
        isOpenToOffers,
        availableFrom: availableFrom ? new Date(availableFrom) : null,
        desiredRoles: desiredRoles || [],
        desiredIndustries: desiredIndustries || [],
        preferredLocations: preferredLocations || [],
        workPreference,
        employmentType: employmentType || [],
        minSalary,
        maxSalary,
        currency,
        salaryPeriod,
        careerGoals,
        willingToRelocate,
        needsVisa,
      },
      update: {
        isActivelySeeking,
        isOpenToOffers,
        availableFrom: availableFrom ? new Date(availableFrom) : null,
        desiredRoles: desiredRoles || [],
        desiredIndustries: desiredIndustries || [],
        preferredLocations: preferredLocations || [],
        workPreference,
        employmentType: employmentType || [],
        minSalary,
        maxSalary,
        currency,
        salaryPeriod,
        careerGoals,
        willingToRelocate,
        needsVisa,
      },
    });

    res.json({
      message: 'Career preferences saved',
      preferences,
    });
  } catch (error) {
    console.error('Save career preferences error:', error);
    res.status(500).json({ error: 'Failed to save career preferences' });
  }
};
