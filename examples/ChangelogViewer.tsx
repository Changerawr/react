import React, { useState } from 'react';
import {
    ChangerawrProvider,
    useChangelog,
    useTagFilter,
    useTags,
    SubscriptionForm,
    ChangerawrWidget,
    ChangerawrWidgetTrigger,
    formatDate,
    formatVersion
} from '@changerawr/react';

// Example Changerawr app configuration
const CONFIG = {
    apiUrl: 'https://your-changerawr-instance.com/api',
    projectId: 'your-project-id',
};

/**
 * Main Example App Component
 */
export default function ChangelogViewerApp() {
    return (
        <ChangerawrProvider
            apiUrl={CONFIG.apiUrl}
            projectId={CONFIG.projectId}
        >
            <div className="app-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
                <header style={{ marginBottom: '40px' }}>
                    <h1>Product Changelog</h1>
                    <p>Stay up-to-date with the latest features and improvements.</p>
                </header>

                <div style={{ display: 'flex', gap: '40px' }}>
                    <main style={{ flex: '1' }}>
                        <ChangelogViewer />
                    </main>

                    <aside style={{ width: '300px' }}>
                        <div style={{ marginBottom: '30px' }}>
                            <h2>Stay Updated</h2>
                            <SubscriptionForm
                                style={{ marginTop: '15px' }}
                                emailLabel="Your Email"
                                nameLabel="Your Name"
                                submitButtonText="Subscribe"
                            />
                        </div>

                        <div>
                            <h2>Quick Updates</h2>
                            <p>Click the button below to see a popup widget.</p>

                            <div style={{ marginTop: '15px' }}>
                                <PopupWidgetExample />
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </ChangerawrProvider>
    );
}

/**
 * Main changelog list with tag filtering
 */
function ChangelogViewer() {
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch tags for filtering
    const { data: tags, isLoading: isLoadingTags } = useTags();

    // Tag filtering
    const {
        selectedTags,
        toggleTag,
        clearTags
    } = useTagFilter(tags || []);

    // Fetch changelog entries with filtering
    const {
        data: entries,
        isLoading,
        error,
        fetchNextPage,
        hasNextPage,
        filters,
        setFilters
    } = useChangelog({
        search: searchQuery,
        tags: selectedTags,
        limit: 5,
    });

    // Handle search input
    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFilters({ search: searchQuery });
    };

    // Handle tag clicks
    const handleTagClick = (tagId: string) => {
        toggleTag(tagId);
    };

    return (
        <div className="changelog-viewer">
            {/* Search bar */}
            <div className="search-container" style={{ marginBottom: '20px' }}>
                <form onSubmit={handleSearch}>
                    <div style={{ display: 'flex' }}>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search updates..."
                            style={{
                                flex: '1',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '4px 0 0 4px',
                            }}
                        />
                        <button
                            type="submit"
                            style={{
                                padding: '10px 15px',
                                background: '#0070f3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0 4px 4px 0',
                                cursor: 'pointer',
                            }}
                        >
                            Search
                        </button>
                    </div>
                </form>
            </div>

            {/* Tag filters */}
            {!isLoadingTags && tags && tags.length > 0 && (
                <div className="tags-container" style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold' }}>Filter by: </span>
                        {tags.map((tag) => (
                            <TagPill
                                key={tag.id}
                                tag={tag}
                                isSelected={selectedTags.includes(tag.id)}
                                onClick={() => handleTagClick(tag.id)}
                            />
                        ))}
                        {selectedTags.length > 0 && (
                            <button
                                onClick={() => clearTags()}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#666',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                }}
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Entries list */}
            <div className="entries-container">
                {isLoading && <p>Loading updates...</p>}

                {error && (
                    <div style={{ color: 'red', padding: '15px', background: '#fff5f5', borderRadius: '4px' }}>
                        Error loading updates: {error.message}
                    </div>
                )}

                {!isLoading && entries && entries.length === 0 && (
                    <div style={{ padding: '20px', textAlign: 'center', background: '#f9f9f9', borderRadius: '4px' }}>
                        No updates found. Try adjusting your search or filters.
                    </div>
                )}

                {entries && entries.length > 0 && (
                    <div className="entries-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {entries.map((entry) => (
                            <ChangelogEntryCard key={entry.id} entry={entry} />
                        ))}

                        {hasNextPage && (
                            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                                <button
                                    onClick={() => fetchNextPage()}
                                    style={{
                                        padding: '10px 20px',
                                        background: '#f5f5f5',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Load more
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Single changelog entry card
 */
function ChangelogEntryCard({ entry }: { entry: any }) {
    return (
        <div
            className="entry-card"
            style={{
                padding: '20px',
                borderRadius: '6px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                border: '1px solid #eee',
                background: 'white',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h3 style={{ margin: 0 }}>{entry.title}</h3>
                {entry.version && (
                    <span
                        style={{
                            fontWeight: 'bold',
                            color: '#0070f3',
                            fontSize: '14px',
                        }}
                    >
            {formatVersion(entry.version)}
          </span>
                )}
            </div>

            <div
                className="entry-content"
                style={{ marginBottom: '15px' }}
                dangerouslySetInnerHTML={{ __html: entry.content }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="entry-tags" style={{ display: 'flex', gap: '6px' }}>
                    {entry.tags.map((tag: any) => (
                        <span
                            key={tag.id}
                            style={{
                                padding: '2px 8px',
                                background: '#f0f0f0',
                                borderRadius: '12px',
                                fontSize: '12px',
                            }}
                        >
              {tag.name}
            </span>
                    ))}
                </div>

                <div className="entry-date" style={{ fontSize: '12px', color: '#666' }}>
                    {formatDate(entry.publishedAt || entry.createdAt, { format: 'relative' })}
                </div>
            </div>
        </div>
    );
}

/**
 * Tag pill component for filtering
 */
function TagPill({ tag, isSelected, onClick }: { tag: any; isSelected: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: '4px 10px',
                borderRadius: '16px',
                fontSize: '14px',
                border: '1px solid #ddd',
                background: isSelected ? '#0070f3' : 'white',
                color: isSelected ? 'white' : '#333',
                cursor: 'pointer',
                transition: 'all 0.2s',
            }}
        >
            {tag.name}
        </button>
    );
}

/**
 * Popup widget example
 */
function PopupWidgetExample() {
    const triggerId = "example-widget-trigger";

    return (
        <>
            <ChangerawrWidgetTrigger
                id={triggerId}
                style={{
                    background: '#333',
                    padding: '10px 15px',
                }}
            >
                Show Latest Updates
            </ChangerawrWidgetTrigger>

            <ChangerawrWidget
                isPopup={true}
                position="bottom-right"
                theme="dark"
                trigger={triggerId}
                maxEntries={3}
            />
        </>
    );
}