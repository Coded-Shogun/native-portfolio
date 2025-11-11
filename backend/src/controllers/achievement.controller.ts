import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { calculateProfileCompletion } from '../utils/profileCompletion';

export const createAchievement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { title, description, date, category, issuer, imageUrl } = req.body;

    const portfolio = await prisma.portfolio.findUnique({ where: { userId } });
    if (!portfolio) {
      res.status(404).json({ error: 'Portfolio not found' });
      return;
    }

    const maxOrder = await prisma.achievement.findFirst({
      where: { portfolioId: portfolio.id },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const achievement = await prisma.achievement.create({
      data: {
        portfolioId: portfolio.id,
        title,
        description,
        date: new Date(date),
        category,
        issuer,
        imageUrl,
        order: (maxOrder?.order || 0) + 1,
      },
    });

    await updateCompletionScore(portfolio.id);

    res.status(201).json({ message: 'Achievement created successfully', achievement });
  } catch (error) {
    console.error('Create achievement error:', error);
    res.status(500).json({ error: 'Failed to create achievement' });
  }
};

export const updateAchievement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const updateData = req.body;

    const portfolio = await prisma.portfolio.findUnique({ where: { userId } });
    if (!portfolio) {
      res.status(404).json({ error: 'Portfolio not found' });
      return;
    }

    const achievement = await prisma.achievement.findFirst({
      where: { id, portfolioId: portfolio.id },
    });

    if (!achievement) {
      res.status(404).json({ error: 'Achievement not found' });
      return;
    }

    const updatedAchievement = await prisma.achievement.update({
      where: { id },
      data: {
        ...updateData,
        date: updateData.date ? new Date(updateData.date) : undefined,
      },
    });

    res.json({ message: 'Achievement updated successfully', achievement: updatedAchievement });
  } catch (error) {
    console.error('Update achievement error:', error);
    res.status(500).json({ error: 'Failed to update achievement' });
  }
};

export const deleteAchievement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const portfolio = await prisma.portfolio.findUnique({ where: { userId } });
    if (!portfolio) {
      res.status(404).json({ error: 'Portfolio not found' });
      return;
    }

    const achievement = await prisma.achievement.findFirst({
      where: { id, portfolioId: portfolio.id },
    });

    if (!achievement) {
      res.status(404).json({ error: 'Achievement not found' });
      return;
    }

    await prisma.achievement.delete({ where: { id } });
    await updateCompletionScore(portfolio.id);

    res.json({ message: 'Achievement deleted successfully' });
  } catch (error) {
    console.error('Delete achievement error:', error);
    res.status(500).json({ error: 'Failed to delete achievement' });
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
