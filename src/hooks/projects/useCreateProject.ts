import { useState, useCallback } from 'react';
import { useChangerawrClient } from '../../context/ChangerawrProvider';
import { Project, ProjectParams } from '../../client/types';
import { parseApiError, ChangerawrError } from '../../client/errors';

/**
 * Return type for the useCreateProject hook
 */
export interface UseCreateProjectResult {
    /** Function to create a project */
    createProject: (params: ProjectParams) => Promise<Project | null>;
    /** Created project data */
    data: Project | null;
    /** Error if creation failed */
    error: ChangerawrError | null;
    /** Loading state */
    isLoading: boolean;
    /** Success state */
    isSuccess: boolean;
    /** Reset state function */
    reset: () => void;
}

/**
 * Hook to create a new project
 * @returns Methods and state for creating projects
 */
export function useCreateProject(): UseCreateProjectResult {
    const client = useChangerawrClient();

    // State for tracking project creation
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [error, setError] = useState<ChangerawrError | null>(null);

    // Function to create project
    const createProject = useCallback(
        async (params: ProjectParams): Promise<Project | null> => {
            try {
                setIsLoading(true);
                setError(null);
                setIsSuccess(false);

                const createdProject = await client.createProject(params);

                setProject(createdProject);
                setIsSuccess(true);

                return createdProject;
            } catch (err) {
                const parsedError = err instanceof ChangerawrError ? err : parseApiError(err);
                setError(parsedError);
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        [client]
    );

    // Reset state function
    const reset = useCallback(() => {
        setProject(null);
        setIsLoading(false);
        setIsSuccess(false);
        setError(null);
    }, []);

    return {
        createProject,
        data: project,
        error,
        isLoading,
        isSuccess,
        reset,
    };
}