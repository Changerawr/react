import { useState, useEffect, useCallback, useRef } from 'react';
import { useChangerawrClient } from '../../context/ChangerawrProvider';
import { WidgetScriptParams } from '../../client/types';
import { parseApiError, ChangerawrError } from '../../client/errors';

/**
 * Return type for the useWidgetScript hook
 */
export interface UseWidgetScriptResult {
    /** Widget script HTML string */
    script: string | null;
    /** Error if fetch failed */
    error: ChangerawrError | null;
    /** Loading state */
    isLoading: boolean;
    /** Function to refresh the widget script */
    refetch: () => Promise<void>;
}

/**
 * Hook to fetch the widget script for a project
 * @param projectId Project ID to generate script for
 * @param options Widget configuration options
 * @returns Widget script and state
 */
export function useWidgetScript(
    projectId: string | undefined,
    options: WidgetScriptParams = {}
): UseWidgetScriptResult {
    const client = useChangerawrClient();

    // State for widget script, loading, and errors
    const [script, setScript] = useState<string | null>(null);
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

    // Function to fetch widget script
    const fetchWidgetScript = useCallback(async () => {
        if (!projectId) {
            setError(new ChangerawrError('Project ID is required for widget script'));
            return;
        }

        try {
            if (isMounted.current) {
                setIsLoading(true);
            }

            const { script } = await client.getWidgetScript(projectId, options);

            if (isMounted.current) {
                setScript(script);
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
    }, [client, projectId, options]);

    // Fetch widget script when projectId or options change
    useEffect(() => {
        fetchWidgetScript();
    }, [projectId, options, fetchWidgetScript]);

    // Refetch function for manual refresh
    const refetch = useCallback(async () => {
        await fetchWidgetScript();
    }, [fetchWidgetScript]);

    return {
        script,
        error,
        isLoading,
        refetch,
    };
}