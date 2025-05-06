import { ApiErrorResponse } from './types';

/**
 * Base Changerawr API error class
 */
export class ChangerawrError extends Error {
    /** Original error or response status */
    public cause?: unknown;
    /** HTTP status code (if applicable) */
    public status?: number;
    /** Detailed error information */
    public details?: unknown;

    constructor(message: string, options?: { cause?: unknown; status?: number; details?: unknown }) {
        super(message);
        this.name = 'ChangerawrError';
        this.cause = options?.cause;
        this.status = options?.status;
        this.details = options?.details;
    }
}

/**
 * Error thrown when API returns a 4xx error
 */
export class ChangerawrRequestError extends ChangerawrError {
    constructor(message: string, options?: { cause?: unknown; status?: number; details?: unknown }) {
        super(message, options);
        this.name = 'ChangerawrRequestError';
    }
}

/**
 * Error thrown when API returns a 5xx error
 */
export class ChangerawrServerError extends ChangerawrError {
    constructor(message: string, options?: { cause?: unknown; status?: number; details?: unknown }) {
        super(message, options);
        this.name = 'ChangerawrServerError';
    }
}

/**
 * Error thrown when client fails to connect to API
 */
export class ChangerawrNetworkError extends ChangerawrError {
    constructor(message: string, options?: { cause?: unknown }) {
        super(message, options);
        this.name = 'ChangerawrNetworkError';
    }
}

/**
 * Error thrown when operation times out
 */
export class ChangerawrTimeoutError extends ChangerawrError {
    constructor(message: string, options?: { cause?: unknown }) {
        super(message, options);
        this.name = 'ChangerawrTimeoutError';
    }
}

/**
 * Error thrown when authentication fails
 */
export class ChangerawrAuthError extends ChangerawrRequestError {
    constructor(message: string, options?: { cause?: unknown; status?: number; details?: unknown }) {
        super(message, options);
        this.name = 'ChangerawrAuthError';
    }
}

/**
 * Parse API error response into appropriate error object
 * @param error The original error object
 * @returns Wrapped error with type information
 */
export function parseApiError(error: unknown): ChangerawrError {
    // Handle Axios errors
    if (typeof error === 'object' && error !== null) {
        const err = error as any;

        // Handle network errors
        if (err.code === 'ECONNABORTED') {
            return new ChangerawrTimeoutError('Request timed out', { cause: error });
        }

        if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
            return new ChangerawrNetworkError('Failed to connect to API', { cause: error });
        }

        // Handle HTTP errors
        if (err.response) {
            const status = err.response.status;
            const data = err.response.data as ApiErrorResponse;

            if (status === 401 || status === 403) {
                return new ChangerawrAuthError(
                    data?.error || 'Authentication failed',
                    { cause: error, status, details: data?.details }
                );
            }

            if (status >= 400 && status < 500) {
                return new ChangerawrRequestError(
                    data?.error || 'Invalid request',
                    { cause: error, status, details: data?.details }
                );
            }

            if (status >= 500) {
                return new ChangerawrServerError(
                    data?.error || 'Server error',
                    { cause: error, status, details: data?.details }
                );
            }
        }
    }

    // Generic fallback
    return new ChangerawrError(
        error instanceof Error ? error.message : 'Unknown error',
        { cause: error }
    );
}