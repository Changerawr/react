import { useState, useCallback } from 'react';
import { useChangerawrClient } from '../../context/ChangerawrProvider';
import { parseApiError, ChangerawrError } from '../../client/errors';

/**
 * Return type for the useUnsubscribe hook
 */
export interface UseUnsubscribeResult {
    /** Function to unsubscribe a subscriber */
    unsubscribe: (subscriberId: string, projectId?: string) => Promise<boolean>;
    /** Error if unsubscribe failed */
    error: ChangerawrError | null;
    /** Loading state */
    isLoading: boolean;
    /** Success state */
    isSuccess: boolean;
    /** Success message */
    message: string | null;
    /** Reset state function */
    reset: () => void;
}

/**
 * Hook to unsubscribe users from project updates
 * @returns Unsubscribe methods and state
 */
export function useUnsubscribe(): UseUnsubscribeResult {
    const client = useChangerawrClient();

    // State for tracking unsubscribe
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [error, setError] = useState<ChangerawrError | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    // Function to unsubscribe
    const unsubscribe = useCallback(
        async (subscriberId: string, projectId?: string): Promise<boolean> => {
            if (!subscriberId) {
                setError(new ChangerawrError('Subscriber ID is required for unsubscribing'));
                return false;
            }

            try {
                setIsLoading(true);
                setError(null);
                setMessage(null);
                setIsSuccess(false);

                const result = await client.unsubscribe(subscriberId, projectId);

                setIsSuccess(true);
                setMessage(result.message || 'Successfully unsubscribed');

                return true;
            } catch (err) {
                const parsedError = err instanceof ChangerawrError ? err : parseApiError(err);
                setError(parsedError);
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [client]
    );

    // Reset state function
    const reset = useCallback(() => {
        setIsLoading(false);
        setIsSuccess(false);
        setError(null);
        setMessage(null);
    }, []);

    return {
        unsubscribe,
        error,
        isLoading,
        isSuccess,
        message,
        reset,
    };
}