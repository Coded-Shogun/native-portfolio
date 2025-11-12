import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

// Common skills database for different roles
const ROLE_SKILLS_DATABASE: Record<string, string[]> = {
  'full stack developer': [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL',
    'REST API', 'GraphQL', 'Docker', 'AWS', 'Git', 'CI/CD', 'Testing', 'Agile'
  ],
  'frontend developer': [
    'HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular',
    'Responsive Design', 'Webpack', 'Tailwind CSS', 'Testing', 'Git', 'UI/UX'
  ],
  'backend developer': [
    'Node.js', 'Python', 'Java', 'Go', 'REST API', 'GraphQL', 'PostgreSQL', 'MongoDB',
    'Redis', 'Docker', 'Kubernetes', 'AWS', 'Microservices', 'Testing', 'Git'
  ],
  'data scientist': [
    'Python', 'R', 'SQL', 'Machine Learning', 'TensorFlow', 'PyTorch', 'Pandas',
    'NumPy', 'Statistics', 'Data Visualization', 'Jupyter', 'Big Data', 'Deep Learning'
  ],
  'devops engineer': [
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Terraform', 'Jenkins', 'CI/CD',
    'Linux', 'Monitoring', 'Git', 'Scripting', 'Ansible', 'Security'
  ],
  'product manager': [
    'Product Strategy', 'Roadmapping', 'Agile', 'Scrum', 'User Research', 'Analytics',
    'SQL', 'A/B Testing', 'Stakeholder Management', 'Wireframing', 'Jira', 'Communication'
  ],
  'ui/ux designer': [
    'Figma', 'Sketch', 'Adobe XD', 'User Research', 'Wireframing', 'Prototyping',
    'Visual Design', 'Interaction Design', 'Usability Testing', 'HTML', 'CSS', 'Design Systems'
  ],
};

// Course recommendations for skills
const LEARNING_RESOURCES: Record<string, string[]> = {
  'JavaScript': ['FreeCodeCamp JavaScript Course', 'JavaScript.info', 'Udemy - JavaScript Masterclass'],
  'React': ['React Official Docs', 'Udemy - React Complete Guide', 'Scrimba React Course'],
  'Node.js': ['Node.js Official Docs', 'The Odin Project', 'Udemy - Node.js Bootcamp'],
  'Python': ['Python.org Tutorial', 'Codecademy Python', 'Real Python'],
  'AWS': ['AWS Free Tier Training', 'A Cloud Guru', 'Udemy - AWS Certified Solutions Architect'],
  'Docker': ['Docker Official Docs', 'Udemy - Docker Mastery', 'Docker for Beginners'],
  'Machine Learning': ['Coursera - Andrew Ng ML Course', 'Fast.ai', 'Kaggle Learn'],
};

// Analyze skills gap for a target role
export const analyzeSkillsGap = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { targetRole, targetIndustry } = req.body;

    if (!targetRole) {
      res.status(400).json({ error: 'Target role is required' });
      return;
    }

    // Get user's portfolio
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
      include: {
        skills: true,
        certifications: true,
        workHistory: true,
      },
    });

    if (!portfolio) {
      res.status(404).json({ error: 'Portfolio not found' });
      return;
    }

    // Get required skills for target role
    const roleLower = targetRole.toLowerCase();
    const requiredSkills = ROLE_SKILLS_DATABASE[roleLower] ||
                          ROLE_SKILLS_DATABASE['full stack developer']; // Default

    // Current skills
    const currentSkills = portfolio.skills.map(s => s.name);
    const currentSkillsLower = currentSkills.map(s => s.toLowerCase());

    // Find missing skills
    const missingSkills = requiredSkills.filter(required =>
      !currentSkillsLower.some(current =>
        current.includes(required.toLowerCase()) ||
        required.toLowerCase().includes(current)
      )
    );

    // Find skills that need improvement (proficiency < 70%)
    const skillsToImprove = portfolio.skills
      .filter(s => s.proficiency < 70)
      .map(s => s.name);

    // Generate learning paths
    const learningPaths: string[] = [];
    missingSkills.slice(0, 5).forEach(skill => {
      const resources = LEARNING_RESOURCES[skill] || ['Search online for courses'];
      learningPaths.push(...resources);
    });

    // Estimate time to bridge gap (rough calculation)
    const estimatedTime = Math.ceil(missingSkills.length * 1.5); // 1.5 months per skill

    // Create skills gap record
    const skillGap = await prisma.skillGap.create({
      data: {
        portfolioId: portfolio.id,
        targetRole,
        targetIndustry,
        currentSkills,
        requiredSkills,
        missingSkills,
        skillsToImprove,
        learningPaths,
        estimatedTime,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Calculate readiness score
    const matchedSkills = requiredSkills.length - missingSkills.length;
    const readinessScore = Math.round((matchedSkills / requiredSkills.length) * 100);

    // Generate priority recommendations
    const prioritySkills = missingSkills.slice(0, 3);

    res.json({
      analysis: {
        targetRole,
        targetIndustry,
        readinessScore,
        totalRequiredSkills: requiredSkills.length,
        matchedSkills,
        missingSkillsCount: missingSkills.length,
        estimatedTime: `${estimatedTime} months`,
      },
      details: {
        currentSkills,
        requiredSkills,
        missingSkills,
        skillsToImprove,
        prioritySkills,
      },
      recommendations: {
        immediate: `Focus on learning: ${prioritySkills.join(', ')}`,
        learningPaths: learningPaths.slice(0, 5),
        certifications: [
          missingSkills.includes('AWS') ? 'AWS Certified Solutions Architect' : null,
          missingSkills.includes('Docker') ? 'Docker Certified Associate' : null,
          missingSkills.includes('Kubernetes') ? 'Certified Kubernetes Administrator' : null,
        ].filter(Boolean),
      },
      motivationalMessage: readinessScore >= 70
        ? `You're ${readinessScore}% ready! Just ${missingSkills.length} skills to go!`
        : `You're on your way! Focus on ${prioritySkills.length} key skills to dramatically improve your chances.`,
    });
  } catch (error) {
    console.error('Analyze skills gap error:', error);
    res.status(500).json({ error: 'Failed to analyze skills gap' });
  }
};

// Get previous skill gap analyses
export const getSkillGapHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      res.status(404).json({ error: 'Portfolio not found' });
      return;
    }

    const skillGaps = await prisma.skillGap.findMany({
      where: {
        portfolioId: portfolio.id,
      },
      orderBy: {
        analysisDate: 'desc',
      },
      take: 10,
    });

    res.json({ skillGaps });
  } catch (error) {
    console.error('Get skill gap history error:', error);
    res.status(500).json({ error: 'Failed to fetch skill gap history' });
  }
};

// Get industry trends and in-demand skills
export const getIndustryTrends = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { industry = 'tech' } = req.query;

    // This would ideally pull from a real-time API or database
    // For now, returning curated data
    const trends = {
      tech: {
        hotSkills: ['AI/ML', 'Cloud Computing', 'Cybersecurity', 'DevOps', 'React', 'Python'],
        emergingSkills: ['Web3', 'Rust', 'Quantum Computing', 'Edge Computing'],
        decliningSkills: ['jQuery', 'Flash', 'Perl'],
        averageSalaries: {
          'AI/ML Engineer': { min: 120000, max: 200000 },
          'Full Stack Developer': { min: 90000, max: 150000 },
          'DevOps Engineer': { min: 100000, max: 170000 },
          'Data Scientist': { min: 110000, max: 180000 },
        },
        jobGrowth: {
          'AI/ML Engineer': '+35%',
          'Cloud Architect': '+28%',
          'Cybersecurity Specialist': '+31%',
        },
      },
    };

    res.json({
      industry,
      trends: trends.tech,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Get industry trends error:', error);
    res.status(500).json({ error: 'Failed to fetch industry trends' });
  }
};
