import { useState, useCallback } from 'react';
import { useChangerawrClient } from '../../context/ChangerawrProvider';
import { SubscribeParams } from '../../client/types';
import { parseApiError, ChangerawrError } from '../../client/errors';

/**
 * Return type for the useSubscribe hook
 */
export interface UseSubscribeResult {
    /** Function to subscribe a user */
    subscribe: (params: SubscribeParams) => Promise<void>;
    /** Success state */
    isSuccess: boolean;
    /** Loading state */
    isLoading: boolean;
    /** Error state */
    error: ChangerawrError | null;
    /** Success message */
    message: string | null;
    /** Reset the subscription state */
    reset: () => void;
}

/**
 * Hook to subscribe users to project updates
 * @param projectId Project ID to subscribe to
 * @returns Subscription methods and state
 */
export function useSubscribe(projectId: string | undefined): UseSubscribeResult {
    const client = useChangerawrClient();

    // State management
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<ChangerawrError | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    // Validate project ID
    const validateProjectId = useCallback(() => {
        if (!projectId) {
            throw new ChangerawrError('Project ID is required for subscription');
        }
        return projectId;
    }, [projectId]);

    // Subscribe function
    const subscribe = useCallback(async (params: SubscribeParams): Promise<void> => {
        try {
            setIsLoading(true);
            setError(null);
            setMessage(null);

            const validProjectId = validateProjectId();

            // Call subscription API
            const result = await client.subscribe(validProjectId, params);

            // Handle success
            setIsSuccess(true);
            setMessage(result.message || 'Subscription successful');
        } catch (err) {
            setIsSuccess(false);
            setError(err instanceof ChangerawrError ? err : parseApiError(err));
        } finally {
            setIsLoading(false);
        }
    }, [client, validateProjectId]);

    // Reset function to clear state
    const reset = useCallback(() => {
        setIsLoading(false);
        setIsSuccess(false);
        setError(null);
        setMessage(null);
    }, []);

    return {
        subscribe,
        isSuccess,
        isLoading,
        error,
        message,
        reset
    };
}