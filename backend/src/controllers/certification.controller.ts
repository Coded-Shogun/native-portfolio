import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { calculateProfileCompletion } from '../utils/profileCompletion';

export const createCertification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { name, issuer, issueDate, expiryDate, credentialId, credentialUrl, imageUrl, description } = req.body;

    const portfolio = await prisma.portfolio.findUnique({ where: { userId } });
    if (!portfolio) {
      res.status(404).json({ error: 'Portfolio not found' });
      return;
    }

    const maxOrder = await prisma.certification.findFirst({
      where: { portfolioId: portfolio.id },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const certification = await prisma.certification.create({
      data: {
        portfolioId: portfolio.id,
        name,
        issuer,
        issueDate: new Date(issueDate),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        credentialId,
        credentialUrl,
        imageUrl,
        description,
        order: (maxOrder?.order || 0) + 1,
      },
    });

    await updateCompletionScore(portfolio.id);

    res.status(201).json({ message: 'Certification created successfully', certification });
  } catch (error) {
    console.error('Create certification error:', error);
    res.status(500).json({ error: 'Failed to create certification' });
  }
};

export const updateCertification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const updateData = req.body;

    const portfolio = await prisma.portfolio.findUnique({ where: { userId } });
    if (!portfolio) {
      res.status(404).json({ error: 'Portfolio not found' });
      return;
    }

    const certification = await prisma.certification.findFirst({
      where: { id, portfolioId: portfolio.id },
    });

    if (!certification) {
      res.status(404).json({ error: 'Certification not found' });
      return;
    }

    const updatedCertification = await prisma.certification.update({
      where: { id },
      data: {
        ...updateData,
        issueDate: updateData.issueDate ? new Date(updateData.issueDate) : undefined,
        expiryDate: updateData.expiryDate ? new Date(updateData.expiryDate) : undefined,
      },
    });

    res.json({ message: 'Certification updated successfully', certification: updatedCertification });
  } catch (error) {
    console.error('Update certification error:', error);
    res.status(500).json({ error: 'Failed to update certification' });
  }
};

export const deleteCertification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const portfolio = await prisma.portfolio.findUnique({ where: { userId } });
    if (!portfolio) {
      res.status(404).json({ error: 'Portfolio not found' });
      return;
    }

    const certification = await prisma.certification.findFirst({
      where: { id, portfolioId: portfolio.id },
    });

    if (!certification) {
      res.status(404).json({ error: 'Certification not found' });
      return;
    }

    await prisma.certification.delete({ where: { id } });
    await updateCompletionScore(portfolio.id);

    res.json({ message: 'Certification deleted successfully' });
  } catch (error) {
    console.error('Delete certification error:', error);
    res.status(500).json({ error: 'Failed to delete certification' });
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
