import { useState, useCallback } from 'react';
import { useChangerawrClient } from '../../context/ChangerawrProvider';
import { EmailConfig, EmailConfigParams } from '../../client/types';
import { parseApiError, ChangerawrError } from '../../client/errors';

/**
 * Return type for the useUpdateEmailConfig hook
 */
export interface UseUpdateEmailConfigResult {
    /** Function to update email configuration */
    updateConfig: (params: EmailConfigParams) => Promise<EmailConfig | null>;
    /** Updated configuration data */
    data: EmailConfig | null;
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
 * Hook to update email configuration for a project
 * @param projectId Project ID to update configuration for
 * @returns Methods and state for updating email configuration
 */
export function useUpdateEmailConfig(projectId: string | undefined): UseUpdateEmailConfigResult {
    const client = useChangerawrClient();

    // State for updated config, loading, success, and errors
    const [config, setConfig] = useState<EmailConfig | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [error, setError] = useState<ChangerawrError | null>(null);

    // Function to validate projectId
    const validateProjectId = useCallback(() => {
        if (!projectId) {
            throw new ChangerawrError('Project ID is required for updating email configuration');
        }
        return projectId;
    }, [projectId]);

    // Function to update email configuration
    const updateConfig = useCallback(
        async (params: EmailConfigParams): Promise<EmailConfig | null> => {
            try {
                setIsLoading(true);
                setError(null);
                setIsSuccess(false);

                const validProjectId = validateProjectId();
                const updatedConfig = await client.updateEmailConfig(validProjectId, params);

                setConfig(updatedConfig);
                setIsSuccess(true);

                return updatedConfig;
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
        setConfig(null);
        setIsLoading(false);
        setIsSuccess(false);
        setError(null);
    }, []);

    return {
        updateConfig,
        data: config,
        error,
        isLoading,
        isSuccess,
        reset,
    };
}