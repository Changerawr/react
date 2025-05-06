import { useState, useCallback } from 'react';
import { useChangerawrClient } from '../../context/ChangerawrProvider';
import { ChangelogEntry } from '../../client/types';
import { parseApiError, ChangerawrError } from '../../client/errors';

/**
 * Return type for the usePublishEntry hook
 */
export interface UsePublishEntryResult {
    /** Function to publish a changelog entry */
    publishEntry: () => Promise<ChangelogEntry | null>;
    /** Function to unpublish a changelog entry */
    unpublishEntry: () => Promise<ChangelogEntry | null>;
    /** Updated entry data */
    data: ChangelogEntry | null;
    /** Error if publish/unpublish failed */
    error: ChangerawrError | null;
    /** Loading state */
    isLoading: boolean;
    /** Success state */
    isSuccess: boolean;
    /** Reset state function */
    reset: () => void;
}

/**
 * Hook to publish or unpublish changelog entries
 * @param projectId Project ID
 * @param entryId Entry ID to publish/unpublish
 * @returns Methods and state for publishing/unpublishing changelog entries
 */
export function usePublishEntry(
    projectId: string | undefined,
    entryId: string | undefined
): UsePublishEntryResult {
    const client = useChangerawrClient();

    // State for tracking publish/unpublish
    const [entry, setEntry] = useState<ChangelogEntry | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [error, setError] = useState<ChangerawrError | null>(null);

    // Function to validate IDs
    const validateIds = useCallback(() => {
        if (!projectId) {
            throw new ChangerawrError('Project ID is required for publishing/unpublishing entries');
        }
        if (!entryId) {
            throw new ChangerawrError('Entry ID is required for publishing/unpublishing entries');
        }
        return { projectId, entryId };
    }, [projectId, entryId]);

    // Function to publish entry
    const publishEntry = useCallback(async (): Promise<ChangelogEntry | null> => {
        try {
            setIsLoading(true);
            setError(null);
            setIsSuccess(false);

            const { projectId, entryId } = validateIds();
            const publishedEntry = await client.publishChangelogEntry(projectId, entryId);

            setEntry(publishedEntry);
            setIsSuccess(true);

            return publishedEntry;
        } catch (err) {
            const parsedError = err instanceof ChangerawrError ? err : parseApiError(err);
            setError(parsedError);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [client, validateIds]);

    // Function to unpublish entry
    const unpublishEntry = useCallback(async (): Promise<ChangelogEntry | null> => {
        try {
            setIsLoading(true);
            setError(null);
            setIsSuccess(false);

            const { projectId, entryId } = validateIds();
            const unpublishedEntry = await client.unpublishChangelogEntry(projectId, entryId);

            setEntry(unpublishedEntry);
            setIsSuccess(true);

            return unpublishedEntry;
        } catch (err) {
            const parsedError = err instanceof ChangerawrError ? err : parseApiError(err);
            setError(parsedError);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [client, validateIds]);

    // Reset state function
    const reset = useCallback(() => {
        setEntry(null);
        setIsLoading(false);
        setIsSuccess(false);
        setError(null);
    }, []);

    return {
        publishEntry,
        unpublishEntry,
        data: entry,
        error,
        isLoading,
        isSuccess,
        reset,
    };
}