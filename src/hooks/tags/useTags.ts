import { useState, useEffect, useCallback, useRef } from 'react';
import { useChangerawrClient } from '../../context/ChangerawrProvider';
import { Tag, PaginationParams } from '../../client/types';
import { parseApiError, ChangerawrError } from '../../client/errors';

/**
 * Options for the useTags hook
 */
export interface UseTagsOptions extends PaginationParams {
    /** Search query to filter tags */
    search?: string;
    /** Whether to skip initial fetch */
    skip?: boolean;
}

/**
 * Return type for the useTags hook
 */
export interface UseTagsResult {
    /** Tag data */
    data: Tag[];
    /** Error if fetch failed */
    error: ChangerawrError | null;
    /** Loading state */
    isLoading: boolean;
    /** Total number of tags */
    total: number;
    /** Number of pages */
    totalPages: number;
    /** Current page */
    page: number;
    /** Function to refresh the tags */
    refetch: () => Promise<void>;
    /** Function to go to a specific page */
    goToPage: (page: number) => void;
    /** Function to set search query */
    setSearch: (search: string) => void;
}

/**
 * Hook to fetch and paginate tags for a project
 * @param projectId Project ID to fetch tags for
 * @param options Hook options
 * @returns Tag data and pagination controls
 */
export function useTags(
    projectId: string | undefined,
    options: UseTagsOptions = {}
): UseTagsResult {
    const client = useChangerawrClient();

    const {
        page: initialPage = 1,
        limit = 20,
        search: initialSearch = '',
        skip = false
    } = options;

    // State for tags, pagination, loading, and errors
    const [tags, setTags] = useState<Tag[]>([]);
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

    // Function to fetch tags
    const fetchTags = useCallback(async () => {
        if (!projectId || skip) {
            return;
        }

        try {
            if (isMounted.current) {
                setIsLoading(true);
            }

            const response = await client.getTags(projectId, {
                page,
                limit,
                search: search || undefined,
            });

            if (isMounted.current) {
                setTags(response.items);
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
    }, [client, projectId, page, limit, search, skip]);

    // Fetch tags when dependencies change
    useEffect(() => {
        fetchTags();
    }, [projectId, page, search, fetchTags]);

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
        await fetchTags();
    }, [fetchTags]);

    return {
        data: tags,
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