# @changerawr/react

A headless React SDK for interacting with Changerawr - the modern changelog management system.

## Features

- 🔄 Full TypeScript support
- 🎣 React hooks for all Changerawr API endpoints
- 🎮 Complete control over UI implementation
- 🧩 Modular architecture - use only what you need
- 🚀 Optimized for performance and bundle size
- 📚 Comprehensive documentation

## Installation

```bash
# npm
npm install @changerawr/react

# yarn
yarn add @changerawr/react

# pnpm
pnpm add @changerawr/react
```

## Quick Start

```tsx
import { ChangerawrProvider, useChangelog } from '@changerawr/react';

// Wrap your app with the provider
function App() {
  return (
    <ChangerawrProvider
      apiUrl="https://your-changerawr-instance.com/api"
      projectId="your-project-id"
      // Optional: API key for authenticated operations
      apiKey="your-api-key"
    >
      <ChangelogContainer />
    </ChangerawrProvider>
  );
}

// Use the hooks in your components
function ChangelogContainer() {
  const { 
    data: entries,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage 
  } = useChangelog({
    limit: 10,
    sort: 'newest'
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {entries?.map(entry => (
        <div key={entry.id}>
          <h2>{entry.title}</h2>
          <p>{entry.content}</p>
          <div>
            {entry.tags.map(tag => (
              <span key={tag.id}>{tag.name}</span>
            ))}
          </div>
        </div>
      ))}
      
      {hasNextPage && (
        <button onClick={() => fetchNextPage()}>
          Load more
        </button>
      )}
    </div>
  );
}
```

## Available Hooks and Components

### Hooks

```tsx
// Projects
const { data: projects } = useProjects();
const { data: project } = useProject('project-id');
const { createProject } = useCreateProject();
const { updateProject } = useUpdateProject('project-id');
const { deleteProject } = useDeleteProject('project-id');

// Changelog entries
const { data: entries } = useChangelog('project-id');
const { data: entry } = useChangelogEntry('project-id', 'entry-id');
const { createEntry } = useCreateEntry('project-id');
const { updateEntry } = useUpdateEntry('project-id', 'entry-id');
const { deleteEntry } = useDeleteEntry('project-id', 'entry-id');
const { publishEntry, unpublishEntry } = usePublishEntry('project-id', 'entry-id');

// Tags
const { data: tags } = useTags('project-id');
const { selectedTags, toggleTag } = useTagFilter();

// Subscriptions
const { subscribe } = useSubscribe('project-id');
const { data: subscribers } = useSubscribers('project-id');
const { unsubscribe } = useUnsubscribe();

// Email
const { data: emailConfig } = useEmailConfig('project-id');
const { updateConfig } = useUpdateEmailConfig('project-id');
const { sendEmail } = useSendEmail('project-id');

// Widget
const { script } = useWidgetScript('project-id');
```

### Components

#### Subscription Form

```tsx
import { ChangerawrProvider, SubscriptionForm } from '@changerawr/react';

function NewsletterSection() {
  return (
    <ChangerawrProvider
      apiUrl="https://your-changerawr-instance.com/api"
      projectId="your-project-id"
    >
      <div className="newsletter-section">
        <h2>Stay Updated</h2>
        <p>Subscribe to our changelog to get the latest updates.</p>
        
        <SubscriptionForm 
          className="custom-form"
          showSubscriptionType={true}
          emailLabel="Your Email"
          nameLabel="Your Name"
          submitButtonText="Keep Me Updated"
          onSuccess={() => {
            // Analytics tracking or other side effects
            console.log('Subscription successful!');
          }}
        />
      </div>
    </ChangerawrProvider>
  );
}
```

#### Widget Components

```tsx
import { 
  ChangerawrProvider, 
  ChangerawrWidget, 
  ChangerawrWidgetTrigger 
} from '@changerawr/react';

function AppFooter() {
  // Generate a unique ID for the trigger
  const widgetTriggerId = "changelog-trigger";
  
  return (
    <footer>
      <div className="footer-links">
        {/* Other footer content */}
        
        {/* Custom trigger button */}
        <ChangerawrWidgetTrigger
          id={widgetTriggerId}
          className="footer-button"
        >
          Recent Updates
        </ChangerawrWidgetTrigger>
        
        {/* Popup widget that uses the trigger */}
        <ChangerawrWidget
          projectId="your-project-id"
          isPopup={true}
          position="bottom-right"
          theme="dark"
          trigger={widgetTriggerId}
          maxEntries={5}
        />
      </div>
    </footer>
  );
}
```

## Development

### Setup

1. Clone the repository
   ```bash
   git clone https://github.com/changerawr/react.git
   cd react
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start development build
   ```bash
   npm run dev
   ```

### Scripts

- `npm run build` - Build the package
- `npm run dev` - Build with watch mode
- `npm run lint` - Lint the code
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run clean` - Clean build artifacts

### Testing Your Changes

You can use `npm link` to test your changes locally:

```bash
# In the SDK directory
npm run build
npm link

# In your project directory
npm link @changerawr/react
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.