import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';
import { Button } from './Button';

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'bordered', 'elevated'],
      description: 'Card variant style',
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Card padding size',
    },
    hoverable: {
      control: 'boolean',
      description: 'Enable hover effects',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'This is a simple card with default styling.',
  },
};

export const WithTitle: Story = {
  args: {
    title: 'Card Title',
    children: 'This card has a title and content.',
  },
};

export const WithTitleAndSubtitle: Story = {
  args: {
    title: 'Project Overview',
    subtitle: 'Last updated 2 hours ago',
    children: 'This card has a title, subtitle, and content that provides detailed information.',
  },
};

export const WithFooter: Story = {
  args: {
    title: 'Job Application',
    subtitle: 'Software Engineer at Tech Corp',
    children: 'You applied for this position on January 15, 2024. The hiring manager has reviewed your application.',
    footer: (
      <div className="flex space-x-2">
        <Button variant="primary" size="sm">View Details</Button>
        <Button variant="secondary" size="sm">Withdraw</Button>
      </div>
    ),
  },
};

export const Bordered: Story = {
  args: {
    variant: 'bordered',
    title: 'Bordered Card',
    children: 'This card has a thicker border for emphasis.',
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    title: 'Elevated Card',
    children: 'This card has a shadow effect for a lifted appearance.',
  },
};

export const Hoverable: Story = {
  args: {
    title: 'Hoverable Card',
    subtitle: 'Hover to see the effect',
    children: 'This card responds to hover interactions.',
    hoverable: true,
  },
};

export const Clickable: Story = {
  args: {
    title: 'Clickable Card',
    subtitle: 'Click me!',
    children: 'This card is clickable and will respond when clicked.',
    onClick: () => alert('Card clicked!'),
  },
};

export const SmallPadding: Story = {
  args: {
    padding: 'sm',
    title: 'Small Padding',
    children: 'This card has reduced padding.',
  },
};

export const LargePadding: Story = {
  args: {
    padding: 'lg',
    title: 'Large Padding',
    children: 'This card has increased padding for more breathing room.',
  },
};

export const NoPadding: Story = {
  args: {
    padding: 'none',
    children: (
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">Custom Content</h3>
        <p>This card has no default padding, allowing for custom layouts.</p>
        <img
          src="https://via.placeholder.com/400x200"
          alt="Placeholder"
          className="w-full h-48 object-cover mt-4"
        />
      </div>
    ),
  },
};

export const ComplexContent: Story = {
  args: {
    title: 'Skills Progress',
    subtitle: 'Your learning journey',
    children: (
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>React</span>
            <span>85%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>TypeScript</span>
            <span>70%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '70%' }}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Node.js</span>
            <span>90%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '90%' }}></div>
          </div>
        </div>
      </div>
    ),
    footer: <Button variant="primary" size="sm">Update Skills</Button>,
  },
};
