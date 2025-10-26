import React, { createContext, useContext, useRef, useMemo, useState, useEffect } from 'react';
import { ChangerawrClient, createChangerawrClient } from '../client/api';
import { ChangerawrClientConfig } from '../client/types';
import { ChangerawrError } from '../client/errors';

/**
 * Context interface for Changerawr provider
 */
interface ChangerawrContextValue {
    /** Client instance for API access */
    client: ChangerawrClient;
    /** Provider configuration */
    config: ChangerawrClientConfig;
    /** Set project ID dynamically */
    setProjectId: (projectId: string) => void;
    /** Current project ID */
    projectId: string | undefined;
    /** Error state */
    error: ChangerawrError | null;
    /** Clear error state */
    clearError: () => void;
    /** Loading state */
    isLoading: boolean;
}

/**
 * Changerawr provider props
 */
export interface ChangerawrProviderProps {
    /** API URL */
    apiUrl: string;
    /** Optional project ID */
    projectId?: string;
    /** Optional API key */
    apiKey?: string;
    /** Optional authentication configuration */
    auth?: {
        type: 'bearer';
        token: string;
    };
    /** Request timeout in milliseconds */
    timeout?: number;
    /** Child components */
    children: React.ReactNode;
}

// Create the context with a default value that will be replaced
const ChangerawrContext = createContext<ChangerawrContextValue | null>(null);

/**
 * Provider component for Changerawr SDK configuration
 * Provides API client to all child components
 */
export const ChangerawrProvider: React.FC<ChangerawrProviderProps> = ({
                                                                          children,
                                                                          apiUrl,
                                                                          projectId: initialProjectId,
                                                                          apiKey,
                                                                          auth,
                                                                          timeout,
                                                                      }) => {
    // State for dynamic project ID
    const [projectId, setProjectId] = useState<string | undefined>(initialProjectId);
    // Error and loading states
    const [error, setError] = useState<ChangerawrError | null>(null);
    // Loading state (reserved for future use)
    const [_isLoading] = useState<boolean>(false);

    // Create configuration object
    const config = useMemo<ChangerawrClientConfig>(
        () => ({
            apiUrl,
            projectId,
            apiKey,
            auth,
            timeout,
        }),
        [apiUrl, projectId, apiKey, auth, timeout]
    );

    // Create client instance (re-create if URL changes)
    const clientRef = useRef<ChangerawrClient | null>(null);

    useEffect(() => {
        try {
            clientRef.current = createChangerawrClient(config);
        } catch (err) {
            if (err instanceof ChangerawrError) {
                setError(err);
            } else {
                setError(new ChangerawrError('Failed to initialize Changerawr client', { cause: err }));
            }
        }
    }, [apiUrl, apiKey, auth?.token, timeout]);

    // Error handling utility
    const clearError = () => setError(null);

    // Create context value
    const contextValue = useMemo<ChangerawrContextValue>(
        () => ({
            client: clientRef.current!,
            config,
            setProjectId,
            projectId,
            error,
            clearError,
            isLoading: _isLoading,
        }),
        [config, projectId, error, _isLoading]
    );

    if (error) {
        console.error('Changerawr SDK initialization error:', error);
    }

    return <ChangerawrContext.Provider value={contextValue}>{children}</ChangerawrContext.Provider>;
};

/**
 * Hook to access the Changerawr context
 * @returns Changerawr context
 * @throws Error if used outside of ChangerawrProvider
 */
export function useChangerawr(): ChangerawrContextValue {
    const context = useContext(ChangerawrContext);

    if (!context) {
        throw new Error('useChangerawr must be used within a ChangerawrProvider');
    }

    return context;
}

/**
 * Hook to get the Changerawr client instance
 * @returns Changerawr client
 * @throws Error if used outside of ChangerawrProvider
 */
export function useChangerawrClient(): ChangerawrClient {
    const { client } = useChangerawr();
    return client;
}

/**
 * Higher-order component to wrap a component with ChangerawrProvider
 * @param Component The component to wrap
 * @param config Provider configuration
 * @returns Wrapped component with context
 */
export function withChangerawr<P extends object>(
    Component: React.ComponentType<P>,
    config: Omit<ChangerawrProviderProps, 'children'>
): React.FC<P> {
    const WithChangerawr: React.FC<P> = (props) => (
        <ChangerawrProvider {...config}>
            <Component {...props} />
        </ChangerawrProvider>
    );

    const displayName = Component.displayName || Component.name || 'Component';
    WithChangerawr.displayName = `withChangerawr(${displayName})`;

    return WithChangerawr;
}