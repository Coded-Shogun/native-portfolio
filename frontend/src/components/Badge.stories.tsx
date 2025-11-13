import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'success', 'warning', 'danger', 'info'],
      description: 'Badge variant style',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Badge size',
    },
    pill: {
      control: 'boolean',
      description: 'Pill shape (fully rounded)',
    },
    dot: {
      control: 'boolean',
      description: 'Show dot indicator',
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default',
  },
};

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Success',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Warning',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Danger',
  },
};

export const Info: Story = {
  args: {
    variant: 'info',
    children: 'Info',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    variant: 'primary',
    children: 'Small',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
    variant: 'primary',
    children: 'Medium',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    variant: 'primary',
    children: 'Large',
  },
};

export const Pill: Story = {
  args: {
    variant: 'primary',
    pill: true,
    children: 'Pill Badge',
  },
};

export const WithDot: Story = {
  args: {
    variant: 'success',
    dot: true,
    children: 'Active',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="danger">Danger</Badge>
      <Badge variant="info">Info</Badge>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Badge size="sm" variant="primary">Small</Badge>
      <Badge size="md" variant="primary">Medium</Badge>
      <Badge size="lg" variant="primary">Large</Badge>
    </div>
  ),
};

export const StatusIndicators: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-sm">Application Status:</span>
        <Badge variant="success" dot>Approved</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm">Server Status:</span>
        <Badge variant="danger" dot>Offline</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm">Build Status:</span>
        <Badge variant="warning" dot>In Progress</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm">Account Status:</span>
        <Badge variant="info" dot>Verified</Badge>
      </div>
    </div>
  ),
};
