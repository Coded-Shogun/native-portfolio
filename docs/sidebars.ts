import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  userGuideSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'user-guide/introduction',
        'user-guide/registration',
        'user-guide/profile-setup',
      ],
    },
    {
      type: 'category',
      label: 'Building Your Portfolio',
      items: [
        'user-guide/basic-information',
        'user-guide/adding-projects',
        'user-guide/work-history',
        'user-guide/certifications',
        'user-guide/achievements',
        'user-guide/skills-management',
      ],
    },
    {
      type: 'category',
      label: 'Getting Hired',
      items: [
        'user-guide/career-preferences',
        'user-guide/job-recommendations',
        'user-guide/skills-gap-analysis',
        'user-guide/application-tracking',
      ],
    },
    {
      type: 'category',
      label: 'Sharing Your Portfolio',
      items: [
        'user-guide/public-portfolio',
        'user-guide/shareable-links',
      ],
    },
  ],

  developerSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'developer-guide/introduction',
        'developer-guide/prerequisites',
        'developer-guide/installation',
        'developer-guide/configuration',
      ],
    },
    {
      type: 'category',
      label: 'Architecture',
      items: [
        'developer-guide/project-structure',
        'developer-guide/tech-stack',
        'developer-guide/database-schema',
        'developer-guide/authentication',
      ],
    },
    {
      type: 'category',
      label: 'Core Features',
      items: [
        'developer-guide/portfolio-management',
        'developer-guide/job-matching-algorithm',
        'developer-guide/skills-gap-engine',
        'developer-guide/application-tracking',
      ],
    },
    {
      type: 'category',
      label: 'Enterprise Features',
      items: [
        'developer-guide/enterprise-overview',
        'developer-guide/enterprise-security',
        'developer-guide/compliance-certifications',
        'developer-guide/performance-optimization',
        'developer-guide/monitoring-logging',
        'developer-guide/enterprise-testing',
        'developer-guide/enterprise-migration',
      ],
    },
    {
      type: 'category',
      label: 'Development',
      items: [
        'developer-guide/running-locally',
        'developer-guide/testing',
        'developer-guide/deployment',
        'developer-guide/contributing',
      ],
    },
  ],

  apiSidebar: [
    {
      type: 'category',
      label: 'Overview',
      items: [
        'api/introduction',
        'api/authentication',
        'api/error-handling',
        'api/rate-limiting',
        'api/security',
      ],
    },
    {
      type: 'category',
      label: 'Authentication',
      items: [
        'api/auth/register',
        'api/auth/login',
        'api/auth/verify-email',
      ],
    },
    {
      type: 'category',
      label: 'Portfolio Management',
      items: [
        'api/portfolio/get-portfolio',
        'api/portfolio/update-portfolio',
        'api/portfolio/projects',
        'api/portfolio/skills',
        'api/portfolio/work-history',
        'api/portfolio/certifications',
        'api/portfolio/achievements',
      ],
    },
    {
      type: 'category',
      label: 'Job-Getting Features',
      items: [
        'api/jobs/recommendations',
        'api/jobs/applications',
        'api/jobs/saved-jobs',
        'api/career/preferences',
        'api/skills-gap/analyze',
      ],
    },
  ],
};

export default sidebars;
