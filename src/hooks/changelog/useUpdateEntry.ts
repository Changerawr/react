import { useState, useCallback } from 'react';
import { useChangerawrClient } from '../../context/ChangerawrProvider';
import { ChangelogEntry, ChangelogEntryParams } from '../../client/types';
import { parseApiError, ChangerawrError } from '../../client/errors';

/**
 * Return type for the useUpdateEntry hook
 */
export interface UseUpdateEntryResult {
    /** Function to update a changelog entry */
    updateEntry: (params: ChangelogEntryParams) => Promise<ChangelogEntry | null>;
    /** Updated entry data */
    data: ChangelogEntry | null;
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
 * Hook to update an existing changelog entry
 * @param projectId Project ID
 * @param entryId Entry ID to update
 * @returns Methods and state for updating changelog entries
 */
export function useUpdateEntry(
    projectId: string | undefined,
    entryId: string | undefined
): UseUpdateEntryResult {
    const client = useChangerawrClient();

    // State for tracking entry update
    const [entry, setEntry] = useState<ChangelogEntry | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [error, setError] = useState<ChangerawrError | null>(null);

    // Function to validate IDs
    const validateIds = useCallback(() => {
        if (!projectId) {
            throw new ChangerawrError('Project ID is required for updating changelog entries');
        }
        if (!entryId) {
            throw new ChangerawrError('Entry ID is required for updating changelog entries');
        }
        return { projectId, entryId };
    }, [projectId, entryId]);

    // Function to update entry
    const updateEntry = useCallback(
        async (params: ChangelogEntryParams): Promise<ChangelogEntry | null> => {
            try {
                setIsLoading(true);
                setError(null);
                setIsSuccess(false);

                const { projectId, entryId } = validateIds();
                const updatedEntry = await client.updateChangelogEntry(projectId, entryId, params);

                setEntry(updatedEntry);
                setIsSuccess(true);

                return updatedEntry;
            } catch (err) {
                const parsedError = err instanceof ChangerawrError ? err : parseApiError(err);
                setError(parsedError);
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        [client, validateIds]
    );

    // Reset state function
    const reset = useCallback(() => {
        setEntry(null);
        setIsLoading(false);
        setIsSuccess(false);
        setError(null);
    }, []);

    return {
        updateEntry,
        data: entry,
        error,
        isLoading,
        isSuccess,
        reset,
    };
}