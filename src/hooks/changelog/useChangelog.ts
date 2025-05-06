import { useState, useEffect, useCallback, useRef } from 'react';
import { useChangerawrClient } from '../../context/ChangerawrProvider';
import { ChangelogEntry } from '../../client/types';
import { parseApiError, ChangerawrError } from '../../client/errors';

/**
 * Options for the useChangelog hook
 */
export interface UseChangelogOptions {
    /** Project ID to fetch entries from */
    projectId?: string;
    /** Search query to filter entries */
    search?: string;
    /** Array of tag IDs to filter by */
    tags?: string[];
    /** Sort order (newest or oldest) */
    sort?: 'newest' | 'oldest';
    /** Number of items per page */
    limit?: number;
    /** Flag to enable auto-pagination */
    enableAutoLoad?: boolean;
    /** Initial cursor for pagination */
    initialCursor?: string;
}

/**
 * Return type for the useChangelog hook
 */
export interface UseChangelogResult {
    /** Changelog entries */
    data: ChangelogEntry[];
    /** Error if fetch failed */
    error: ChangerawrError | null;
    /** Loading state */
    isLoading: boolean;
    /** Loading next page state */
    isLoadingMore: boolean;
    /** Whether there's a next page to load */
    hasNextPage: boolean;
    /** Function to load the next page */
    fetchNextPage: () => Promise<void>;
    /** Function to refresh the entries */
    refetch: () => Promise<void>;
    /** Current filter state */
    filters: {
        search: string | undefined;
        tags: string[] | undefined;
        sort: 'newest' | 'oldest';
    };
    /** Function to update filters */
    setFilters: (filters: Partial<UseChangelogOptions>) => void;
}

/**
 * Hook to fetch and paginate changelog entries
 * @param options Hook options
 * @returns Changelog entries and pagination controls
 */
export function useChangelog(options: UseChangelogOptions = {}): UseChangelogResult {
    const client = useChangerawrClient();

    // Destructure options with defaults
    const {
        projectId,
        search: initialSearch,
        tags: initialTags,
        sort: initialSort = 'newest',
        limit = 10,
        enableAutoLoad = false,
        initialCursor,
    } = options;

    // State for entries, pagination, loading, and errors
    const [entries, setEntries] = useState<ChangelogEntry[]>([]);
    const [nextCursor, setNextCursor] = useState<string | undefined>(initialCursor);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [error, setError] = useState<ChangerawrError | null>(null);

    // Filter state
    const [search, setSearch] = useState<string | undefined>(initialSearch);
    const [tags, setTags] = useState<string[] | undefined>(initialTags);
    const [sort, setSort] = useState<'newest' | 'oldest'>(initialSort);

    // Tracking if component is mounted to avoid state updates after unmount
    const isMounted = useRef<boolean>(true);
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    // Reset state when projectId or filters change
    useEffect(() => {
        if (projectId) {
            setEntries([]);
            setNextCursor(undefined);
            setError(null);
            fetchEntries(true);
        }
    }, [projectId, search, tags, sort]);

    // Function to set filters
    const setFilters = useCallback((newFilters: Partial<UseChangelogOptions>) => {
        if (newFilters.search !== undefined) setSearch(newFilters.search);
        if (newFilters.tags !== undefined) setTags(newFilters.tags);
        if (newFilters.sort !== undefined) setSort(newFilters.sort);
    }, []);

    // Function to fetch entries (initial or next page)
    const fetchEntries = useCallback(async (isInitialFetch = false) => {
        if (!projectId) {
            if (isMounted.current) {
                setError(new ChangerawrError('Project ID is required'));
            }
            return;
        }

        try {
            if (isInitialFetch) {
                if (isMounted.current) {
                    setIsLoading(true);
                }
            } else {
                if (isMounted.current) {
                    setIsLoadingMore(true);
                }
            }

            const response = await client.getChangelog(projectId, {
                cursor: isInitialFetch ? undefined : nextCursor,
                limit,
                search,
                tags,
                sort,
            });

            if (isMounted.current) {
                if (isInitialFetch) {
                    setEntries(response.items);
                } else {
                    setEntries(prev => [...prev, ...response.items]);
                }

                setNextCursor(response.nextCursor);
                setError(null);
            }
        } catch (err) {
            if (isMounted.current) {
                setError(err instanceof ChangerawrError ? err : parseApiError(err));
            }
        } finally {
            if (isMounted.current) {
                setIsLoading(false);
                setIsLoadingMore(false);
            }
        }
    }, [projectId, nextCursor, limit, search, tags, sort, client]);

    // Function to fetch next page
    const fetchNextPage = useCallback(async () => {
        if (nextCursor) {
            await fetchEntries(false);
        }
    }, [nextCursor, fetchEntries]);

    // Function to refetch entries
    const refetch = useCallback(async () => {
        await fetchEntries(true);
    }, [fetchEntries]);

    // Auto-load functionality
    useEffect(() => {
        if (enableAutoLoad && nextCursor && !isLoading && !isLoadingMore && !error) {
            fetchNextPage();
        }
    }, [enableAutoLoad, nextCursor, isLoading, isLoadingMore, error, fetchNextPage]);

    return {
        data: entries,
        error,
        isLoading,
        isLoadingMore,
        hasNextPage: !!nextCursor,
        fetchNextPage,
        refetch,
        filters: {
            search,
            tags,
            sort,
        },
        setFilters,
    };
}