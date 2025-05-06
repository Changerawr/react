import { useState, useCallback } from 'react';
import { useChangerawrClient } from '../../context/ChangerawrProvider';
import { ChangelogEntry, ChangelogEntryParams } from '../../client/types';
import { parseApiError, ChangerawrError } from '../../client/errors';

/**
 * Return type for the useCreateEntry hook
 */
export interface UseCreateEntryResult {
    /** Function to create a changelog entry */
    createEntry: (params: ChangelogEntryParams) => Promise<ChangelogEntry | null>;
    /** Created entry data */
    data: ChangelogEntry | null;
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
 * Hook to create a new changelog entry
 * @param projectId Project ID to create entry for
 * @returns Methods and state for creating changelog entries
 */
export function useCreateEntry(projectId: string | undefined): UseCreateEntryResult {
    const client = useChangerawrClient();

    // State for tracking entry creation
    const [entry, setEntry] = useState<ChangelogEntry | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [error, setError] = useState<ChangerawrError | null>(null);

    // Function to validate projectId
    const validateProjectId = useCallback(() => {
        if (!projectId) {
            throw new ChangerawrError('Project ID is required for creating changelog entries');
        }
        return projectId;
    }, [projectId]);

    // Function to create entry
    const createEntry = useCallback(
        async (params: ChangelogEntryParams): Promise<ChangelogEntry | null> => {
            try {
                setIsLoading(true);
                setError(null);
                setIsSuccess(false);

                const validProjectId = validateProjectId();
                const createdEntry = await client.createChangelogEntry(validProjectId, params);

                setEntry(createdEntry);
                setIsSuccess(true);

                return createdEntry;
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
        setEntry(null);
        setIsLoading(false);
        setIsSuccess(false);
        setError(null);
    }, []);

    return {
        createEntry,
        data: entry,
        error,
        isLoading,
        isSuccess,
        reset,
    };
}