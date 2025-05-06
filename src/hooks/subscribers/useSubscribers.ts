import { useState, useEffect, useCallback, useRef } from 'react';
import { useChangerawrClient } from '../../context/ChangerawrProvider';
import { Subscriber, PaginationParams } from '../../client/types';
import { parseApiError, ChangerawrError } from '../../client/errors';

/**
 * Options for the useSubscribers hook
 */
export interface UseSubscribersOptions extends PaginationParams {
    /** Search query to filter subscribers */
    search?: string;
    /** Whether to skip initial fetch */
    skip?: boolean;
}

/**
 * Return type for the useSubscribers hook
 */
export interface UseSubscribersResult {
    /** Subscribers data */
    data: Subscriber[];
    /** Error if fetch failed */
    error: ChangerawrError | null;
    /** Loading state */
    isLoading: boolean;
    /** Total number of subscribers */
    total: number;
    /** Number of pages */
    totalPages: number;
    /** Current page */
    page: number;
    /** Function to refresh the subscribers */
    refetch: () => Promise<void>;
    /** Function to go to a specific page */
    goToPage: (page: number) => void;
    /** Function to set search query */
    setSearch: (search: string) => void;
}

/**
 * Hook to fetch and paginate subscribers for a project
 * @param projectId Project ID to fetch subscribers for
 * @param options Hook options
 * @returns Subscribers data and pagination controls
 */
export function useSubscribers(
    projectId: string | undefined,
    options: UseSubscribersOptions = {}
): UseSubscribersResult {
    const client = useChangerawrClient();

    const {
        page: initialPage = 1,
        limit = 20,
        search: initialSearch = '',
        skip = false
    } = options;

    // State for subscribers, pagination, loading, and errors
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [page, setPage] = useState<number>(initialPage);
    const [search, setSearch] = useState<string>(initialSearch);
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

    // Function to validate projectId
    const validateProjectId = useCallback(() => {
        if (!projectId) {
            throw new ChangerawrError('Project ID is required for fetching subscribers');
        }
        return projectId;
    }, [projectId]);

    // Function to fetch subscribers
    const fetchSubscribers = useCallback(async () => {
        if (skip) {
            return;
        }

        try {
            if (isMounted.current) {
                setIsLoading(true);
            }

            const validProjectId = validateProjectId();
            const response = await client.getSubscribers(validProjectId, {
                page,
                limit,
                search: search || undefined,
            });

            if (isMounted.current) {
                setSubscribers(response.items);
                setTotal(response.pagination.total);
                setTotalPages(response.pagination.totalPages);
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
    }, [client, validateProjectId, page, limit, search, skip]);

    // Fetch subscribers when dependencies change
    useEffect(() => {
        if (projectId) {
            fetchSubscribers();
        }
    }, [projectId, page, search, fetchSubscribers]);

    // Navigation function
    const goToPage = useCallback((newPage: number) => {
        setPage(Math.max(1, Math.min(newPage, totalPages)));
    }, [totalPages]);

    // Search function
    const handleSetSearch = useCallback((newSearch: string) => {
        setSearch(newSearch);
        setPage(1); // Reset to first page when search changes
    }, []);

    // Refetch function
    const refetch = useCallback(async () => {
        await fetchSubscribers();
    }, [fetchSubscribers]);

    return {
        data: subscribers,
        error,
        isLoading,
        total,
        totalPages,
        page,
        refetch,
        goToPage,
        setSearch: handleSetSearch,
    };
}