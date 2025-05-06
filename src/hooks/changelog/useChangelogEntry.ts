import { useState, useEffect, useCallback, useRef } from 'react';
import { useChangerawrClient } from '../../context/ChangerawrProvider';
import { ChangelogEntry } from '../../client/types';
import { parseApiError, ChangerawrError } from '../../client/errors';

/**
 * Options for the useChangelogEntry hook
 */
export interface UseChangelogEntryOptions {
    /** Whether to skip initial fetch */
    skip?: boolean;
}

/**
 * Return type for the useChangelogEntry hook
 */
export interface UseChangelogEntryResult {
    /** Changelog entry data */
    data: ChangelogEntry | null;
    /** Error if fetch failed */
    error: ChangerawrError | null;
    /** Loading state */
    isLoading: boolean;
    /** Function to refresh the entry */
    refetch: () => Promise<void>;
}

/**
 * Hook to fetch a single changelog entry
 * @param projectId Project ID
 * @param entryId Entry ID to fetch
 * @param options Hook options
 * @returns Changelog entry data and state
 */
export function useChangelogEntry(
    projectId: string | undefined,
    entryId: string | undefined,
    options: UseChangelogEntryOptions = {}
): UseChangelogEntryResult {
    const client = useChangerawrClient();
    const { skip = false } = options;

    // State for entry, loading, and errors
    const [entry, setEntry] = useState<ChangelogEntry | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(!skip);
    const [error, setError] = useState<ChangerawrError | null>(null);

    // Tracking if component is mounted
    const isMounted = useRef<boolean>(true);
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    // Function to fetch entry
    const fetchEntry = useCallback(async () => {
        if (!projectId || !entryId || skip) {
            return;
        }

        try {
            if (isMounted.current) {
                setIsLoading(true);
            }

            const data = await client.getChangelogEntry(projectId, entryId);

            if (isMounted.current) {
                setEntry(data);
                setError(null);
            }
        } catch (err) {
            if (isMounted.current) {
                setError(err instanceof ChangerawrError ? err : parseApiError(err));
            }
        } finally {
            if (isMounted.current) {
                setIsLoading(false);
            }
        }
    }, [client, projectId, entryId, skip]);

    // Fetch entry when projectId or entryId changes
    useEffect(() => {
        fetchEntry();
    }, [projectId, entryId, fetchEntry]);

    // Refetch function for manual refresh
    const refetch = useCallback(async () => {
        await fetchEntry();
    }, [fetchEntry]);

    return {
        data: entry,
        error,
        isLoading,
        refetch,
    };
}