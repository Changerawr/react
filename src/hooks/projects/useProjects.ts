import { useState, useEffect, useCallback, useRef } from 'react';
import { useChangerawrClient } from '../../context/ChangerawrProvider';
import { Project, PaginationParams } from '../../client/types';
import { parseApiError, ChangerawrError } from '../../client/errors';

/**
 * Options for the useProjects hook
 */
export interface UseProjectsOptions extends PaginationParams {
    /** Whether to skip initial fetch */
    skip?: boolean;
}

/**
 * Return type for the useProjects hook
 */
export interface UseProjectsResult {
    /** Projects data */
    data: Project[];
    /** Error if fetch failed */
    error: ChangerawrError | null;
    /** Loading state */
    isLoading: boolean;
    /** Total number of projects */
    total: number;
    /** Number of pages */
    totalPages: number;
    /** Current page */
    page: number;
    /** Function to refresh the projects */
    refetch: () => Promise<void>;
    /** Function to go to a specific page */
    goToPage: (page: number) => void;
}

/**
 * Hook to fetch and paginate projects
 * @param options Hook options
 * @returns Projects data and pagination controls
 */
export function useProjects(options: UseProjectsOptions = {}): UseProjectsResult {
    const client = useChangerawrClient();

    const { page: initialPage = 1, limit = 10, skip = false } = options;

    // State for projects, pagination, loading, and errors
    const [projects, setProjects] = useState<Project[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [page, setPage] = useState<number>(initialPage);
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

    // Function to fetch projects
    const fetchProjects = useCallback(async () => {
        if (skip) {
            return;
        }

        try {
            if (isMounted.current) {
                setIsLoading(true);
            }

            const response = await client.getProjects({
                page,
                limit,
            });

            if (isMounted.current) {
                setProjects(response.items);
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
    }, [client, page, limit, skip]);

    // Fetch projects when dependencies change
    useEffect(() => {
        fetchProjects();
    }, [page, fetchProjects]);

    // Navigation function
    const goToPage = useCallback((newPage: number) => {
        setPage(Math.max(1, Math.min(newPage, totalPages || 1)));
    }, [totalPages]);

    // Refetch function
    const refetch = useCallback(async () => {
        await fetchProjects();
    }, [fetchProjects]);

    return {
        data: projects,
        error,
        isLoading,
        total,
        totalPages,
        page,
        refetch,
        goToPage,
    };
}