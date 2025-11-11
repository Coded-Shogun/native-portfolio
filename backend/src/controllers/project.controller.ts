import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { calculateProfileCompletion } from '../utils/profileCompletion';

export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const {
      title,
      description,
      role,
      imageUrl,
      projectUrl,
      githubUrl,
      technologies,
      startDate,
      endDate,
      isFeatured,
    } = req.body;

    // Get user's portfolio
    const portfolio = await prisma.portfolio.findUnique({ where: { userId } });
    if (!portfolio) {
      res.status(404).json({ error: 'Portfolio not found' });
      return;
    }

    // Get max order for new project
    const maxOrder = await prisma.project.findFirst({
      where: { portfolioId: portfolio.id },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const project = await prisma.project.create({
      data: {
        portfolioId: portfolio.id,
        title,
        description,
        role,
        imageUrl,
        projectUrl,
        githubUrl,
        technologies: technologies || [],
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isFeatured: isFeatured || false,
        order: (maxOrder?.order || 0) + 1,
      },
    });

    // Recalculate completion score
    await updateCompletionScore(portfolio.id);

    res.status(201).json({ message: 'Project created successfully', project });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
};

export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const updateData = req.body;

    // Verify ownership
    const portfolio = await prisma.portfolio.findUnique({ where: { userId } });
    if (!portfolio) {
      res.status(404).json({ error: 'Portfolio not found' });
      return;
    }

    const project = await prisma.project.findFirst({
      where: { id, portfolioId: portfolio.id },
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Update project
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        ...updateData,
        startDate: updateData.startDate ? new Date(updateData.startDate) : undefined,
        endDate: updateData.endDate ? new Date(updateData.endDate) : undefined,
      },
    });

    res.json({ message: 'Project updated successfully', project: updatedProject });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Verify ownership
    const portfolio = await prisma.portfolio.findUnique({ where: { userId } });
    if (!portfolio) {
      res.status(404).json({ error: 'Portfolio not found' });
      return;
    }

    const project = await prisma.project.findFirst({
      where: { id, portfolioId: portfolio.id },
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    await prisma.project.delete({ where: { id } });

    // Recalculate completion score
    await updateCompletionScore(portfolio.id);

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
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
