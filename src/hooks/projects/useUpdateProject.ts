import { useState, useCallback } from 'react';
import { useChangerawrClient } from '../../context/ChangerawrProvider';
import { Project, ProjectParams } from '../../client/types';
import { parseApiError, ChangerawrError } from '../../client/errors';

/**
 * Return type for the useUpdateProject hook
 */
export interface UseUpdateProjectResult {
    /** Function to update a project */
    updateProject: (params: ProjectParams) => Promise<Project | null>;
    /** Updated project data */
    data: Project | null;
    /** Error if update failed */
    error: ChangerawrError | null;
    /** Loading state */
    isLoading: boolean;
    /** Success state */
    isSuccess: boolean;
    /** Reset state function */
    reset: () => void;
}

/**
 * Hook to update an existing project
 * @param projectId Project ID to update
 * @returns Methods and state for updating projects
 */
export function useUpdateProject(projectId: string | undefined): UseUpdateProjectResult {
    const client = useChangerawrClient();

    // State for tracking project update
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [error, setError] = useState<ChangerawrError | null>(null);

    // Function to validate projectId
    const validateProjectId = useCallback(() => {
        if (!projectId) {
            throw new ChangerawrError('Project ID is required for updating projects');
        }
        return projectId;
    }, [projectId]);

    // Function to update project
    const updateProject = useCallback(
        async (params: ProjectParams): Promise<Project | null> => {
            try {
                setIsLoading(true);
                setError(null);
                setIsSuccess(false);

                const validProjectId = validateProjectId();
                const updatedProject = await client.updateProject(validProjectId, params);

                setProject(updatedProject);
                setIsSuccess(true);

                return updatedProject;
            } catch (err) {
                const parsedError = err instanceof ChangerawrError ? err : parseApiError(err);
                setError(parsedError);
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        [client, validateProjectId]
    );

    // Reset state function
    const reset = useCallback(() => {
        setProject(null);
        setIsLoading(false);
        setIsSuccess(false);
        setError(null);
    }, []);

    return {
        updateProject,
        data: project,
        error,
        isLoading,
        isSuccess,
        reset,
    };
}