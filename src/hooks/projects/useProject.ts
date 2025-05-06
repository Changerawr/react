import { useState, useEffect, useCallback, useRef } from 'react';
import { useChangerawrClient } from '../../context/ChangerawrProvider';
import { Project } from '../../client/types';
import { parseApiError, ChangerawrError } from '../../client/errors';

/**
 * Options for the useProject hook
 */
export interface UseProjectOptions {
    /** Whether to skip initial fetch */
    skip?: boolean;
}

/**
 * Return type for the useProject hook
 */
export interface UseProjectResult {
    /** Project data */
    data: Project | null;
    /** Error if fetch failed */
    error: ChangerawrError | null;
    /** Loading state */
    isLoading: boolean;
    /** Function to refresh the project */
    refetch: () => Promise<void>;
}

/**
 * Hook to fetch a single project by ID
 * @param projectId Project ID to fetch
 * @param options Hook options
 * @returns Project data and state
 */
export function useProject(
    projectId: string | undefined,
    options: UseProjectOptions = {}
): UseProjectResult {
    const client = useChangerawrClient();
    const { skip = false } = options;

    // State for project, loading, and errors
    const [project, setProject] = useState<Project | null>(null);
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

    // Function to fetch project
    const fetchProject = useCallback(async () => {
        if (!projectId || skip) {
            return;
        }

        try {
            if (isMounted.current) {
                setIsLoading(true);
            }

            const data = await client.getProject(projectId);

            if (isMounted.current) {
                setProject(data);
                setError(null);
            }
        } catch (err) {
            if (isMounted.current) {
                setError(err instanceof ChangerawrError ? err : parseApiError(err));
                setProject(null);
            }
        } finally {
            if (isMounted.current) {
                setIsLoading(false);
            }
        }
    }, [projectId, skip, client]);

    // Fetch project when projectId changes
    useEffect(() => {
        fetchProject();
    }, [projectId, fetchProject]);

    // Refetch function for manual refresh
    const refetch = useCallback(async () => {
        await fetchProject();
    }, [fetchProject]);

    return {
        data: project,
        error,
        isLoading,
        refetch,
    };
}