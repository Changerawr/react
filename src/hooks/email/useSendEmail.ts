import { useState, useCallback } from 'react';
import { useChangerawrClient } from '../../context/ChangerawrProvider';
import { SendEmailParams } from '../../client/types';
import { parseApiError, ChangerawrError } from '../../client/errors';

/**
 * Return type for the useSendEmail hook
 */
export interface UseSendEmailResult {
    /** Function to send email notification */
    sendEmail: (params: SendEmailParams) => Promise<{
        success: boolean;
        message: string;
        recipientCount: number;
    } | null>;
    /** Error if sending failed */
    error: ChangerawrError | null;
    /** Loading state */
    isLoading: boolean;
    /** Success state */
    isSuccess: boolean;
    /** Recipient count from last successful send */
    recipientCount: number | null;
    /** Success message */
    message: string | null;
    /** Reset state function */
    reset: () => void;
}

/**
 * Hook to send email notifications for a project
 * @param projectId Project ID to send notifications for
 * @returns Methods and state for sending email notifications
 */
export function useSendEmail(projectId: string | undefined): UseSendEmailResult {
    const client = useChangerawrClient();

    // State for tracking the email sending process
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [error, setError] = useState<ChangerawrError | null>(null);
    const [recipientCount, setRecipientCount] = useState<number | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    // Function to validate projectId
    const validateProjectId = useCallback(() => {
        if (!projectId) {
            throw new ChangerawrError('Project ID is required for sending email notifications');
        }
        return projectId;
    }, [projectId]);

    // Function to send email
    const sendEmail = useCallback(
        async (params: SendEmailParams): Promise<{
            success: boolean;
            message: string;
            recipientCount: number;
        } | null> => {
            try {
                setIsLoading(true);
                setError(null);
                setIsSuccess(false);
                setMessage(null);

                const validProjectId = validateProjectId();
                const result = await client.sendEmail(validProjectId, params);

                setIsSuccess(true);
                setMessage(result.message);
                setRecipientCount(result.recipientCount);

                return result;
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
        setIsLoading(false);
        setIsSuccess(false);
        setError(null);
        setMessage(null);
        setRecipientCount(null);
    }, []);

    return {
        sendEmail,
        error,
        isLoading,
        isSuccess,
        recipientCount,
        message,
        reset,
    };
}