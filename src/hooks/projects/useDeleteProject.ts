import { useState, useCallback } from 'react';
import { useChangerawrClient } from '../../context/ChangerawrProvider';
import { parseApiError, ChangerawrError } from '../../client/errors';

/**
 * Return type for the useDeleteProject hook
 */
export interface UseDeleteProjectResult {
    /** Function to delete a project */
    deleteProject: () => Promise<boolean>;
    /** Error if deletion failed */
    error: ChangerawrError | null;
    /** Loading state */
    isLoading: boolean;
    /** Success state */
    isSuccess: boolean;
    /** Reset state function */
    reset: () => void;
}

/**
 * Hook to delete a project
 * @param projectId Project ID to delete
 * @returns Methods and state for deleting projects
 */
export function useDeleteProject(projectId: string | undefined): UseDeleteProjectResult {
    const client = useChangerawrClient();

    // State for tracking project deletion
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [error, setError] = useState<ChangerawrError | null>(null);

    // Function to validate projectId
    const validateProjectId = useCallback(() => {
        if (!projectId) {
            throw new ChangerawrError('Project ID is required for deleting projects');
        }
        return projectId;
    }, [projectId]);

    // Function to delete project
    const deleteProject = useCallback(async (): Promise<boolean> => {
        try {
            setIsLoading(true);
            setError(null);
            setIsSuccess(false);

            const validProjectId = validateProjectId();
            await client.deleteProject(validProjectId);

            setIsSuccess(true);
            return true;
        } catch (err) {
            const parsedError = err instanceof ChangerawrError ? err : parseApiError(err);
            setError(parsedError);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [client, validateProjectId]);

    // Reset state function
    const reset = useCallback(() => {
        setIsLoading(false);
        setIsSuccess(false);
        setError(null);
    }, []);

    return {
        deleteProject,
        error,
        isLoading,
        isSuccess,
        reset,
    };
}