import { useState, useEffect, useCallback, useRef } from 'react';
import { useChangerawrClient } from '../../context/ChangerawrProvider';
import { EmailConfig } from '../../client/types';
import { parseApiError, ChangerawrError } from '../../client/errors';

/**
 * Return type for the useEmailConfig hook
 */
export interface UseEmailConfigResult {
    /** Email configuration data */
    data: EmailConfig | null;
    /** Error if fetch failed */
    error: ChangerawrError | null;
    /** Loading state */
    isLoading: boolean;
    /** Function to refresh the configuration */
    refetch: () => Promise<void>;
    /** Function to test email configuration */
    testEmailConfig: (testEmail: string) => Promise<{ success: boolean; message: string }>;
}

/**
 * Hook to fetch email configuration for a project
 * @param projectId Project ID to fetch configuration for
 * @returns Email configuration data and methods
 */
export function useEmailConfig(projectId: string | undefined): UseEmailConfigResult {
    const client = useChangerawrClient();

    // State for email configuration, loading, and errors
    const [config, setConfig] = useState<EmailConfig | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<ChangerawrError | null>(null);

    // Tracking if component is mounted
    const isMounted = useRef<boolean>(true);
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    // Function to validate projectId
    const validateProjectId = useCallback(() => {
        if (!projectId) {
            throw new ChangerawrError('Project ID is required for email configuration');
        }
        return projectId;
    }, [projectId]);

    // Function to fetch email configuration
    const fetchEmailConfig = useCallback(async () => {
        try {
            setIsLoading(true);

            const validProjectId = validateProjectId();
            const data = await client.getEmailConfig(validProjectId);

            if (isMounted.current) {
                setConfig(data);
                setError(null);
            }
        } catch (err) {
            if (isMounted.current) {
                setError(err instanceof ChangerawrError ? err : parseApiError(err));
            }
        } finally {
            if (isMounted.current) {
                setIsLoading(false);
            }
        }
    }, [client, validateProjectId]);

    // Fetch email configuration when projectId changes
    useEffect(() => {
        if (projectId) {
            fetchEmailConfig();
        }
    }, [projectId, fetchEmailConfig]);

    // Function to test email configuration
    const testEmailConfig = useCallback(
        async (testEmail: string): Promise<{ success: boolean; message: string }> => {
            try {
                const validProjectId = validateProjectId();
                return await client.testEmailConfig(validProjectId, testEmail);
            } catch (err) {
                const error = err instanceof ChangerawrError ? err : parseApiError(err);
                return {
                    success: false,
                    message: error.message || 'Failed to test email configuration',
                };
            }
        },
        [client, validateProjectId]
    );

    // Refetch function for manual refresh
    const refetch = useCallback(async () => {
        await fetchEmailConfig();
    }, [fetchEmailConfig]);

    return {
        data: config,
        error,
        isLoading,
        refetch,
        testEmailConfig,
    };
}