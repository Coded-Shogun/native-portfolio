import { Request, Response } from 'express';
import prisma from '../config/database';

export const getPublicPortfolio = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const portfolio = await prisma.portfolio.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: false, // Don't expose email publicly
          },
        },
        projects: {
          where: {},
          orderBy: [
            { isFeatured: 'desc' },
            { order: 'asc' },
          ],
        },
        certifications: { orderBy: { issueDate: 'desc' } },
        workHistory: { orderBy: { startDate: 'desc' } },
        achievements: { orderBy: { date: 'desc' } },
        skills: { orderBy: { order: 'asc' } },
      },
    });

    if (!portfolio) {
      res.status(404).json({ error: 'Portfolio not found' });
      return;
    }

    if (!portfolio.isPublic) {
      res.status(403).json({ error: 'This portfolio is private' });
      return;
    }

    res.json({ portfolio });
  } catch (error) {
    console.error('Get public portfolio error:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
};

export const getMarketplace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, skills, page = '1', limit = '12' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {
      isPublic: true,
      isSearchable: true,
    };

    // Search by name or title
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { bio: { contains: search as string, mode: 'insensitive' } },
        {
          user: {
            OR: [
              { firstName: { contains: search as string, mode: 'insensitive' } },
              { lastName: { contains: search as string, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    // Filter by skills (comma-separated)
    if (skills) {
      const skillArray = (skills as string).split(',').map((s) => s.trim());
      where.skills = {
        some: {
          name: { in: skillArray, mode: 'insensitive' },
        },
      };
    }

    // Get total count
    const total = await prisma.portfolio.count({ where });

    // Get portfolios
    const portfolios = await prisma.portfolio.findMany({
      where,
      skip,
      take: limitNum,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        skills: {
          select: {
            name: true,
            category: true,
          },
          take: 5,
        },
        projects: {
          where: { isFeatured: true },
          take: 3,
          select: {
            id: true,
            title: true,
            imageUrl: true,
          },
        },
        _count: {
          select: {
            projects: true,
            certifications: true,
            workHistory: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    res.json({
      portfolios,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get marketplace error:', error);
    res.status(500).json({ error: 'Failed to fetch marketplace data' });
  }
};

export const searchSkills = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get unique skills from all public portfolios
    const skills = await prisma.skill.findMany({
      where: {
        portfolio: {
          isPublic: true,
          isSearchable: true,
        },
      },
      select: {
        name: true,
        category: true,
      },
      distinct: ['name'],
      take: 50,
      orderBy: {
        name: 'asc',
      },
    });

    res.json({ skills });
  } catch (error) {
    console.error('Search skills error:', error);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
};
