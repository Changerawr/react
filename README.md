# @changerawr/react

**Build-it-yourself React SDK for consuming Changerawr changelogs**

A headless, lightweight React SDK focused on providing the tools you need to build custom changelog experiences. No pre-built UI components forcing a specific design—just flexible hooks and utilities to display your Changerawr data however you want.

## Philosophy

This SDK follows a **"build it yourself"** approach: we provide the building blocks (hooks, types, API client), and you create the UI that fits your needs. Perfect for developers who want complete control over their changelog presentation without the bloat of unnecessary admin features.

## Features

- 🎨 **Headless & Flexible** - Build your own UI, your way
- 🔄 **Full TypeScript Support** - Complete type safety and IntelliSense
- 🎣 **Focused Hooks** - Only what you need: read changelogs, filter by tags, handle subscriptions
- 📝 **Markdown Ready** - Integrates with `@changerawr/markdown` for rich content rendering
- 🧩 **Modular** - Tree-shakeable, use only what you need
- 🚀 **Lightweight** - No admin bloat, optimized bundle size
- 📚 **Well Documented** - Clear examples and TypeScript definitions

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

## API Reference

### Hooks

This SDK provides focused hooks for consuming and displaying changelog data:

```tsx
// Changelog entries - fetch and display
const {
  data: entries,           // Array of changelog entries
  isLoading,               // Loading state
  error,                   // Error object if any
  fetchNextPage,           // Load more entries (pagination)
  hasNextPage,             // Whether more entries are available
  filters,                 // Current filter state
  setFilters               // Update filters (search, tags, sort)
} = useChangelog({
  limit: 10,
  sort: 'newest',
  search: 'feature',
  tags: ['new', 'improved']
});

// Single changelog entry - for detail pages
const {
  data: entry,
  isLoading,
  error,
  refetch
} = useChangelogEntry(projectId, entryId);

// Tags - for filtering
const {
  data: tags,
  isLoading,
  error
} = useTags(projectId);

// Tag filtering - local state management
const {
  selectedTags,            // Array of selected tag IDs
  toggleTag,               // Toggle a tag selection
  clearTags,               // Clear all selections
  isTagSelected            // Check if tag is selected
} = useTagFilter();

// Subscriptions - let users subscribe to updates
const {
  subscribe,               // Function to subscribe
  isLoading,
  error,
  success
} = useSubscribe(projectId);

const {
  unsubscribe,             // Function to unsubscribe
  isLoading,
  error,
  success
} = useUnsubscribe();

// Widget - embed changelog widget
const {
  script,                  // Widget embed script
  isLoading
} = useWidgetScript(projectId, {
  theme: 'dark',
  position: 'bottom-right',
  isPopup: true
});
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

## Markdown Rendering

Changerawr entries support markdown content. To render markdown in your changelog UI, use the `@changerawr/markdown` package:

```bash
npm install @changerawr/markdown
```

### Basic Usage

```tsx
import { ChangerawrProvider, useChangelog } from '@changerawr/react';
import { MarkdownRenderer } from '@changerawr/markdown/react';

function ChangelogList() {
  const { data: entries, isLoading } = useChangelog();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="changelog-list">
      {entries?.map(entry => (
        <article key={entry.id} className="changelog-entry">
          <h2>{entry.title}</h2>
          <div className="entry-metadata">
            <time>{new Date(entry.publishedAt).toLocaleDateString()}</time>
            {entry.tags.map(tag => (
              <span key={tag.id} className="tag">{tag.name}</span>
            ))}
          </div>

          {/* Render markdown content */}
          <MarkdownRenderer
            content={entry.content}
            format="tailwind"
            className="prose max-w-none"
          />
        </article>
      ))}
    </div>
  );
}
```

### Advanced Markdown Options

```tsx
import { MarkdownRenderer } from '@changerawr/markdown/react';

<MarkdownRenderer
  content={entry.content}
  format="tailwind"              // or "html" for plain HTML
  className="prose dark:prose-invert"
  onRender={(html, tokens) => {
    // Optional: do something after rendering
    console.log('Rendered markdown');
  }}
/>
```

See the [@changerawr/markdown documentation](https://github.com/changerawr/markdown) for more details on markdown rendering, custom extensions, styling, and advanced features.

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