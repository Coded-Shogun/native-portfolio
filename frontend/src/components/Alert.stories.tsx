import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from './Alert';

const meta = {
  title: 'Components/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error'],
      description: 'Alert variant/type',
    },
    dismissible: {
      control: 'boolean',
      description: 'Show close button',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '500px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
  args: {
    variant: 'info',
    children: 'This is an informational message.',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Your action was completed successfully!',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Please review this warning before proceeding.',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    children: 'An error occurred. Please try again.',
  },
};

export const WithTitle: Story = {
  args: {
    variant: 'info',
    title: 'Information',
    children: 'This alert has a title for better context.',
  },
};

export const SuccessWithTitle: Story = {
  args: {
    variant: 'success',
    title: 'Success!',
    children: 'Your portfolio has been published successfully.',
  },
};

export const WarningWithTitle: Story = {
  args: {
    variant: 'warning',
    title: 'Warning',
    children: 'Your session will expire in 5 minutes. Please save your work.',
  },
};

export const ErrorWithTitle: Story = {
  args: {
    variant: 'error',
    title: 'Error',
    children: 'Failed to save your changes. Please check your connection and try again.',
  },
};

export const Dismissible: Story = {
  args: {
    variant: 'info',
    title: 'Tip',
    children: 'You can close this alert by clicking the X button.',
    dismissible: true,
    onClose: () => alert('Alert dismissed!'),
  },
};

export const LongContent: Story = {
  args: {
    variant: 'warning',
    title: 'Important Notice',
    children: (
      <>
        <p className="mb-2">
          This is a longer alert message that contains multiple paragraphs of information.
        </p>
        <p className="mb-2">
          Please read this carefully as it contains important details about your account and actions you may need to take.
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Review your recent activity</li>
          <li>Update your security settings</li>
          <li>Verify your contact information</li>
        </ul>
      </>
    ),
    dismissible: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4" style={{ width: '600px' }}>
      <Alert variant="info" title="Information">
        This is an informational alert.
      </Alert>
      <Alert variant="success" title="Success">
        Your action was completed successfully.
      </Alert>
      <Alert variant="warning" title="Warning">
        Please review this warning message.
      </Alert>
      <Alert variant="error" title="Error">
        An error occurred during processing.
      </Alert>
    </div>
  ),
};
