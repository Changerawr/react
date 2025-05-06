import { useState, useCallback } from 'react';
import { useChangerawrClient } from '../../context/ChangerawrProvider';
import { parseApiError, ChangerawrError } from '../../client/errors';

/**
 * Return type for the useDeleteEntry hook
 */
export interface UseDeleteEntryResult {
    /** Function to delete a changelog entry */
    deleteEntry: () => Promise<boolean>;
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
 * Hook to delete a changelog entry
 * @param projectId Project ID
 * @param entryId Entry ID to delete
 * @returns Methods and state for deleting changelog entries
 */
export function useDeleteEntry(
    projectId: string | undefined,
    entryId: string | undefined
): UseDeleteEntryResult {
    const client = useChangerawrClient();

    // State for tracking deletion
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [error, setError] = useState<ChangerawrError | null>(null);

    // Function to validate IDs
    const validateIds = useCallback(() => {
        if (!projectId) {
            throw new ChangerawrError('Project ID is required for deleting changelog entries');
        }
        if (!entryId) {
            throw new ChangerawrError('Entry ID is required for deleting changelog entries');
        }
        return { projectId, entryId };
    }, [projectId, entryId]);

    // Function to delete entry
    const deleteEntry = useCallback(async (): Promise<boolean> => {
        try {
            setIsLoading(true);
            setError(null);
            setIsSuccess(false);

            const { projectId, entryId } = validateIds();
            await client.deleteChangelogEntry(projectId, entryId);

            setIsSuccess(true);
            return true;
        } catch (err) {
            const parsedError = err instanceof ChangerawrError ? err : parseApiError(err);
            setError(parsedError);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [client, validateIds]);

    // Reset state function
    const reset = useCallback(() => {
        setIsLoading(false);
        setIsSuccess(false);
        setError(null);
    }, []);

    return {
        deleteEntry,
        error,
        isLoading,
        isSuccess,
        reset,
    };
}