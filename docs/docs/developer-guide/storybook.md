---
sidebar_position: 7
---

# Storybook Component Library

## 📚 Overview

Storybook is integrated into the Career Portfolio Manager to provide an interactive component library and development environment. It enables developers to build, test, and document UI components in isolation from the main application.

## 🎯 Why Storybook?

### Benefits

- **Component Isolation**: Develop and test components independently
- **Visual Testing**: See components in all their states and variations
- **Documentation**: Auto-generated documentation from TypeScript types
- **Collaboration**: Share components with designers and stakeholders
- **Consistency**: Ensure design system compliance across the application
- **Faster Development**: Build components without running the full application

### Use Cases

1. **Component Development**: Build new UI components in isolation
2. **Visual Regression Testing**: Catch UI bugs before they reach production
3. **Design System Documentation**: Living documentation of all UI components
4. **Onboarding**: Help new developers understand component APIs
5. **Accessibility Testing**: Test components for accessibility compliance

## 🚀 Getting Started

### Installation

Storybook is already installed and configured in the frontend workspace:

```bash
cd frontend
```

### Running Storybook

Start the Storybook development server:

```bash
npm run storybook
```

This will start Storybook at **http://localhost:6006**

### Building Storybook

Build a static version for deployment:

```bash
npm run build-storybook
```

The static files will be generated in `storybook-static/` directory.

## 📂 Project Structure

```
frontend/
├── .storybook/
│   ├── main.ts              # Storybook configuration
│   └── preview.ts           # Global decorators and parameters
├── src/
│   ├── components/
│   │   ├── Button.tsx       # Component implementation
│   │   ├── Button.stories.tsx # Component stories
│   │   ├── Input.tsx
│   │   ├── Input.stories.tsx
│   │   └── ...
│   ├── pages/
│   │   ├── NotFound.tsx
│   │   ├── NotFound.stories.tsx
│   │   └── ...
│   └── stories/
│       ├── Introduction.mdx  # Storybook documentation
│       └── ...
```

## 🎨 Component Library

### Available Components

#### 1. Button

Interactive button component with multiple variants and states.

**Variants:**
- `primary` - Primary action buttons
- `secondary` - Secondary actions
- `danger` - Destructive actions
- `success` - Positive confirmations

**Sizes:**
- `sm` - Small (padding: 12px)
- `md` - Medium (padding: 16px)
- `lg` - Large (padding: 24px)

**States:**
- Default
- Disabled
- Loading

**Usage Example:**
```tsx
import { Button } from '@/components/Button';

<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>
```

#### 2. Input

Form input component with label, validation, and helper text support.

**Features:**
- Label with optional required indicator
- Error message display
- Helper text support
- Multiple input types (text, email, password, etc.)
- Three sizes (sm, md, lg)
- Disabled state

**Usage Example:**
```tsx
import { Input } from '@/components/Input';

<Input
  label="Email Address"
  type="email"
  placeholder="you@example.com"
  error={errors.email}
  required
/>
```

#### 3. Card

Flexible container component for displaying grouped content.

**Variants:**
- `default` - Standard border
- `bordered` - Emphasized border
- `elevated` - Shadow effect

**Features:**
- Optional title and subtitle
- Flexible content area
- Optional footer section
- Hover effects
- Click handling
- Customizable padding

**Usage Example:**
```tsx
import { Card } from '@/components/Card';

<Card
  title="Project Overview"
  subtitle="Last updated 2 hours ago"
  variant="elevated"
  footer={<Button>View Details</Button>}
>
  <p>Card content goes here...</p>
</Card>
```

#### 4. Badge

Status indicator and label component.

**Variants:**
- `default` - Gray
- `primary` - Blue
- `success` - Green
- `warning` - Yellow
- `danger` - Red
- `info` - Cyan

**Features:**
- Multiple sizes (sm, md, lg)
- Pill shape option
- Dot indicator option

**Usage Example:**
```tsx
import { Badge } from '@/components/Badge';

<Badge variant="success" dot>
  Active
</Badge>
```

#### 5. Alert

Component for displaying important messages and notifications.

**Variants:**
- `info` - Informational messages
- `success` - Success confirmations
- `warning` - Warning messages
- `error` - Error messages

**Features:**
- Optional title
- Dismissible option
- Icon indicators
- Flexible content

**Usage Example:**
```tsx
import { Alert } from '@/components/Alert';

<Alert
  variant="success"
  title="Success!"
  dismissible
  onClose={handleClose}
>
  Your portfolio has been published.
</Alert>
```

## 🛠 Creating New Stories

### Story File Structure

Create a `.stories.tsx` file next to your component:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './MyComponent';

const meta = {
  title: 'Components/MyComponent',
  component: MyComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
      description: 'Component variant',
    },
  },
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'primary',
    children: 'My Component',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'My Component',
  },
};
```

### Story Best Practices

1. **Start with Default**: Always include a `Default` story
2. **Show All Variants**: Create stories for each variant/state
3. **Use ArgTypes**: Define controls for interactive props
4. **Add Descriptions**: Document props with JSDoc comments
5. **Include Edge Cases**: Show disabled, loading, error states
6. **Use Decorators**: Add context providers or styling wrappers

### Example: Complex Story

```tsx
export const ComplexExample: Story = {
  render: () => (
    <div className="space-y-4">
      <MyComponent variant="primary">Primary</MyComponent>
      <MyComponent variant="secondary">Secondary</MyComponent>
      <MyComponent variant="danger" disabled>Disabled</MyComponent>
    </div>
  ),
};
```

## ⚙️ Configuration

### Main Configuration

Located at `.storybook/main.ts`:

```typescript
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-docs',
    '@storybook/addon-onboarding',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
};

export default config;
```

### Preview Configuration

Located at `.storybook/preview.ts`:

```typescript
import type { Preview } from '@storybook/react-vite';
import '../src/index.css'; // Import Tailwind styles

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#f9fafb' },
        { name: 'white', value: '#ffffff' },
        { name: 'dark', value: '#1f2937' },
      ],
    },
  },
};

export default preview;
```

## 🎨 Design System Integration

### Tailwind CSS

All components use Tailwind CSS utility classes. The design system includes:

**Colors:**
- Primary: Blue (`primary-600`, `primary-700`)
- Gray scale: (`gray-50` to `gray-900`)
- Semantic colors: Green (success), Yellow (warning), Red (danger)

**Typography:**
- Font sizes: `text-sm`, `text-base`, `text-lg`, `text-xl`
- Font weights: `font-medium`, `font-semibold`, `font-bold`

**Spacing:**
- Padding: `p-2`, `p-4`, `p-6`, `p-8`
- Margins: `m-2`, `m-4`, `m-6`, `m-8`
- Gaps: `gap-2`, `gap-4`, `gap-6`

**Border Radius:**
- Default: `rounded-lg` (0.5rem)
- Pill: `rounded-full`

### Custom CSS Classes

Defined in `src/index.css`:

```css
.btn-primary {
  @apply px-4 py-2 bg-primary-600 text-white rounded-lg
         hover:bg-primary-700 transition-colors font-medium
         disabled:opacity-50 disabled:cursor-not-allowed;
}

.input {
  @apply w-full px-4 py-2 border border-gray-300 rounded-lg
         focus:ring-2 focus:ring-primary-500 focus:border-transparent
         outline-none transition-all;
}

.card {
  @apply bg-white p-6 rounded-lg border border-gray-200
         hover:shadow-lg transition-shadow;
}
```

## 📖 Documentation Features

### Auto-Documentation

Storybook automatically generates documentation from:

1. **TypeScript Types**: Prop types are extracted and displayed
2. **JSDoc Comments**: Prop descriptions appear in the docs
3. **Default Values**: Shown in the documentation table
4. **ArgTypes**: Control types and options

### Example Component with Docs

```tsx
export interface ButtonProps {
  /**
   * Button variant style
   */
  variant?: 'primary' | 'secondary' | 'danger';
  /**
   * Button size
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Button contents
   */
  children: React.ReactNode;
  /**
   * Is the button disabled?
   * @default false
   */
  disabled?: boolean;
}
```

### MDX Documentation

Create `.mdx` files in `src/stories/` for custom documentation:

```mdx
import { Meta } from '@storybook/blocks';

<Meta title="Design System/Colors" />

# Color Palette

Our application uses a consistent color palette...
```

## 🧪 Testing with Storybook

### Visual Testing

Use Storybook for visual regression testing:

1. **Snapshot Testing**: Capture component snapshots
2. **Interaction Testing**: Test user interactions
3. **Accessibility Testing**: Check WCAG compliance

### Integration with Testing Tools

Storybook integrates with:

- **Chromatic**: Visual regression testing
- **Jest**: Unit testing with stories
- **Playwright**: E2E testing
- **Axe**: Accessibility testing

## 🚀 Deployment

### Deploy to Vercel

```bash
npm run build-storybook
# Upload storybook-static/ to hosting
```

### Deploy to Netlify

```bash
npm run build-storybook
# Connect repository and set build command
```

### Deploy to GitHub Pages

Add to `.github/workflows/storybook.yml`:

```yaml
name: Deploy Storybook
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build-storybook
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{secrets.GITHUB_TOKEN}}
          publish_dir: ./storybook-static
```

## 🎓 Learning Resources

### Official Documentation

- [Storybook Documentation](https://storybook.js.org/docs)
- [React Storybook Tutorial](https://storybook.js.org/tutorials/intro-to-storybook/react/en/get-started/)
- [Storybook Addons](https://storybook.js.org/addons)

### Video Tutorials

- [Storybook Crash Course](https://www.youtube.com/results?search_query=storybook+tutorial)
- [Advanced Storybook Patterns](https://www.youtube.com/results?search_query=advanced+storybook)

## 🤝 Best Practices

### Component Development

1. **Build Components in Isolation**: Start with Storybook before integrating
2. **Document as You Build**: Add stories while developing
3. **Test All States**: Include default, hover, active, disabled states
4. **Follow Design System**: Use Tailwind classes consistently
5. **Make Components Reusable**: Avoid hardcoded values

### Story Organization

1. **Use Descriptive Titles**: `Components/Form/Input`
2. **Create Logical Groups**: Organize by category
3. **Start Simple**: Default story should be minimal
4. **Build Complexity**: Add advanced examples gradually
5. **Document Edge Cases**: Show error states and edge cases

### Accessibility

1. **Test with Keyboard**: Ensure keyboard navigation works
2. **Add ARIA Labels**: Include proper accessibility attributes
3. **Check Color Contrast**: Ensure sufficient contrast ratios
4. **Test with Screen Readers**: Verify screen reader compatibility

## 📊 Component Statistics

| Component | Stories | Variants | Documented |
|-----------|---------|----------|------------|
| Button    | 9       | 4        | ✅         |
| Input     | 11      | 3 sizes  | ✅         |
| Card      | 11      | 3        | ✅         |
| Badge     | 13      | 6        | ✅         |
| Alert     | 11      | 4        | ✅         |
| **Total** | **55+** | **20+**  | **✅**     |

## 🔗 Related Documentation

- Frontend Architecture: See project documentation for frontend setup details
- Component Guidelines: Follow React and TypeScript best practices
- [Testing Strategy](./enterprise-testing.md)
- Design System: Tailwind CSS integration (documented above)

## 📝 Troubleshooting

### Storybook Won't Start

**Issue**: Storybook fails to start

**Solutions**:
```bash
# Clear cache
rm -rf node_modules/.cache

# Reinstall dependencies
npm ci

# Try again
npm run storybook
```

### Components Not Styled

**Issue**: Tailwind styles not appearing

**Solution**: Ensure `index.css` is imported in `.storybook/preview.ts`:
```typescript
import '../src/index.css';
```

### Stories Not Showing

**Issue**: Stories don't appear in Storybook

**Solution**: Check file naming convention:
- Must end with `.stories.tsx` or `.stories.ts`
- Must be in the `src/` directory
- Check `.storybook/main.ts` stories glob pattern

## 🎉 Summary

Storybook provides a powerful development environment for building and documenting UI components. By using Storybook, the Career Portfolio Manager maintains a consistent, well-documented component library that accelerates development and improves code quality.

### Key Features

- ✅ **55+ Component Stories** across 5 major components
- ✅ **Interactive Controls** for real-time prop manipulation
- ✅ **Auto-Generated Documentation** from TypeScript types
- ✅ **Design System Integration** with Tailwind CSS
- ✅ **Accessibility Testing** built-in
- ✅ **Visual Testing** capabilities
- ✅ **Developer Experience** optimized for fast iteration

Start exploring components at **http://localhost:6006** after running `npm run storybook`!
