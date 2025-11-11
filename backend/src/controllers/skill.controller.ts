import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { calculateProfileCompletion } from '../utils/profileCompletion';

export const createSkill = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { name, category, proficiency } = req.body;

    const portfolio = await prisma.portfolio.findUnique({ where: { userId } });
    if (!portfolio) {
      res.status(404).json({ error: 'Portfolio not found' });
      return;
    }

    const maxOrder = await prisma.skill.findFirst({
      where: { portfolioId: portfolio.id },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const skill = await prisma.skill.create({
      data: {
        portfolioId: portfolio.id,
        name,
        category,
        proficiency: proficiency || 50,
        order: (maxOrder?.order || 0) + 1,
      },
    });

    await updateCompletionScore(portfolio.id);

    res.status(201).json({ message: 'Skill created successfully', skill });
  } catch (error) {
    console.error('Create skill error:', error);
    res.status(500).json({ error: 'Failed to create skill' });
  }
};

export const updateSkill = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { name, category, proficiency } = req.body;

    const portfolio = await prisma.portfolio.findUnique({ where: { userId } });
    if (!portfolio) {
      res.status(404).json({ error: 'Portfolio not found' });
      return;
    }

    const skill = await prisma.skill.findFirst({
      where: { id, portfolioId: portfolio.id },
    });

    if (!skill) {
      res.status(404).json({ error: 'Skill not found' });
      return;
    }

    const updatedSkill = await prisma.skill.update({
      where: { id },
      data: { name, category, proficiency },
    });

    res.json({ message: 'Skill updated successfully', skill: updatedSkill });
  } catch (error) {
    console.error('Update skill error:', error);
    res.status(500).json({ error: 'Failed to update skill' });
  }
};

export const deleteSkill = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const portfolio = await prisma.portfolio.findUnique({ where: { userId } });
    if (!portfolio) {
      res.status(404).json({ error: 'Portfolio not found' });
      return;
    }

    const skill = await prisma.skill.findFirst({
      where: { id, portfolioId: portfolio.id },
    });

    if (!skill) {
      res.status(404).json({ error: 'Skill not found' });
      return;
    }

    await prisma.skill.delete({ where: { id } });
    await updateCompletionScore(portfolio.id);

    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Delete skill error:', error);
    res.status(500).json({ error: 'Failed to delete skill' });
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
