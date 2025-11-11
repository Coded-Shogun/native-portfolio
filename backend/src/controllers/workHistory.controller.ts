import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { calculateProfileCompletion } from '../utils/profileCompletion';

export const createWorkHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const {
      company,
      position,
      location,
      employmentType,
      startDate,
      endDate,
      isCurrentJob,
      description,
      achievements,
    } = req.body;

    const portfolio = await prisma.portfolio.findUnique({ where: { userId } });
    if (!portfolio) {
      res.status(404).json({ error: 'Portfolio not found' });
      return;
    }

    const maxOrder = await prisma.workHistory.findFirst({
      where: { portfolioId: portfolio.id },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const workHistory = await prisma.workHistory.create({
      data: {
        portfolioId: portfolio.id,
        company,
        position,
        location,
        employmentType,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isCurrentJob: isCurrentJob || false,
        description,
        achievements: achievements || [],
        order: (maxOrder?.order || 0) + 1,
      },
    });

    await updateCompletionScore(portfolio.id);

    res.status(201).json({ message: 'Work history created successfully', workHistory });
  } catch (error) {
    console.error('Create work history error:', error);
    res.status(500).json({ error: 'Failed to create work history' });
  }
};

export const updateWorkHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const updateData = req.body;

    const portfolio = await prisma.portfolio.findUnique({ where: { userId } });
    if (!portfolio) {
      res.status(404).json({ error: 'Portfolio not found' });
      return;
    }

    const workHistory = await prisma.workHistory.findFirst({
      where: { id, portfolioId: portfolio.id },
    });

    if (!workHistory) {
      res.status(404).json({ error: 'Work history not found' });
      return;
    }

    const updatedWorkHistory = await prisma.workHistory.update({
      where: { id },
      data: {
        ...updateData,
        startDate: updateData.startDate ? new Date(updateData.startDate) : undefined,
        endDate: updateData.endDate ? new Date(updateData.endDate) : undefined,
      },
    });

    res.json({ message: 'Work history updated successfully', workHistory: updatedWorkHistory });
  } catch (error) {
    console.error('Update work history error:', error);
    res.status(500).json({ error: 'Failed to update work history' });
  }
};

export const deleteWorkHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const portfolio = await prisma.portfolio.findUnique({ where: { userId } });
    if (!portfolio) {
      res.status(404).json({ error: 'Portfolio not found' });
      return;
    }

    const workHistory = await prisma.workHistory.findFirst({
      where: { id, portfolioId: portfolio.id },
    });

    if (!workHistory) {
      res.status(404).json({ error: 'Work history not found' });
      return;
    }

    await prisma.workHistory.delete({ where: { id } });
    await updateCompletionScore(portfolio.id);

    res.json({ message: 'Work history deleted successfully' });
  } catch (error) {
    console.error('Delete work history error:', error);
    res.status(500).json({ error: 'Failed to delete work history' });
  }
};

async function updateCompletionScore(portfolioId: string): Promise<void> {
  const portfolio = await prisma.portfolio.findUnique({
    where: { id: portfolioId },
    include: {
      projects: true,
      certifications: true,
      workHistory: true,
      achievements: true,
      skills: true,
    },
  });

  if (portfolio) {
    const completionScore = calculateProfileCompletion(portfolio);
    await prisma.portfolio.update({
      where: { id: portfolioId },
      data: { completionScore },
    });
  }
}
