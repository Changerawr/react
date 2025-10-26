import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
    ChangerawrClientConfig,
    CursorPaginationParams,
    CursorPaginatedResponse,
    PaginationParams,
    PaginatedResponse,
    ChangelogEntry,
    Tag,
    SubscribeParams,
    WidgetScriptParams,
} from './types';
import { parseApiError } from './errors';

/**
 * Changerawr API client for consuming changelog data
 * Provides methods for reading changelogs, subscribing, and embedding widgets
 * This is a "build it yourself" SDK - focused on display/consumption, not admin features
 */
export class ChangerawrClient {
    private readonly axios: AxiosInstance;
    private readonly config: ChangerawrClientConfig;

    /**
     * Create a new Changerawr API client
     * @param config Client configuration options
     */
    constructor(config: ChangerawrClientConfig) {
        this.config = config;

        // Create Axios instance with base configuration
        this.axios = axios.create({
            baseURL: config.apiUrl,
            timeout: config.timeout || 30000,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` }),
                ...(config.auth?.type === 'bearer' && { 'Authorization': `Bearer ${config.auth.token}` }),
            },
        });

        // Add response interceptor for error handling
        this.axios.interceptors.response.use(
            (response) => response,
            (error) => {
                throw parseApiError(error);
            }
        );
    }

    /**
     * Execute a request with error handling
     * @param config Request configuration
     * @returns Promise with the response data
     */
    private async request<T>(config: AxiosRequestConfig): Promise<T> {
        try {
            const response: AxiosResponse<T> = await this.axios(config);
            return response.data;
        } catch (error) {
            throw parseApiError(error);
        }
    }

    // =========================================================================
    // Changelog Entries - Read Only
    // =========================================================================

    /**
     * Get changelog entries with pagination, search, and filtering
     * @param projectId Project ID
     * @param params Optional pagination and filtering parameters
     * @returns Promise with paginated changelog entries
     */
    async getChangelog(
        projectId: string,
        params?: CursorPaginationParams & {
            search?: string;
            tags?: string[];
            sort?: 'newest' | 'oldest';
        }
    ): Promise<CursorPaginatedResponse<ChangelogEntry>> {
        // Convert tags array to comma-separated string
        const queryParams = {
            ...params,
            tags: params?.tags?.join(','),
        };

        return this.request<CursorPaginatedResponse<ChangelogEntry>>({
            method: 'GET',
            url: `/changelog/${projectId}/entries`,
            params: queryParams,
        });
    }

    /**
     * Get a single changelog entry by ID
     * @param projectId Project ID
     * @param entryId Entry ID
     * @returns Promise with changelog entry
     */
    async getChangelogEntry(projectId: string, entryId: string): Promise<ChangelogEntry> {
        return this.request<ChangelogEntry>({
            method: 'GET',
            url: `/projects/${projectId}/changelog/${entryId}`,
        });
    }

    // =========================================================================
    // Tags
    // =========================================================================

    /**
     * Get tags for a project
     * @param projectId Project ID
     * @param params Optional pagination and search parameters
     * @returns Promise with paginated tags
     */
    async getTags(
        projectId: string,
        params?: PaginationParams & {
            search?: string;
        }
    ): Promise<PaginatedResponse<Tag>> {
        return this.request<PaginatedResponse<Tag>>({
            method: 'GET',
            url: `/projects/${projectId}/changelog/tags`,
            params,
        });
    }

    // =========================================================================
    // Subscriptions
    // =========================================================================

    /**
     * Subscribe to changelog updates
     * @param projectId Project ID
     * @param params Subscription parameters (email, name, preferences)
     * @returns Promise with success response
     */
    async subscribe(projectId: string, params: SubscribeParams): Promise<{ success: boolean, message: string }> {
        return this.request<{ success: boolean, message: string }>({
            method: 'POST',
            url: '/subscribe',
            data: {
                ...params,
                projectId,
            },
        });
    }

    /**
     * Unsubscribe from changelog updates
     * @param subscriberId Subscriber ID
     * @param projectId Optional project ID (if only unsubscribing from one project)
     * @returns Promise with success response
     */
    async unsubscribe(subscriberId: string, projectId?: string): Promise<{ success: boolean, message: string }> {
        return this.request<{ success: boolean, message: string }>({
            method: 'DELETE',
            url: `/subscribers/${subscriberId}`,
            params: projectId ? { projectId } : undefined,
        });
    }

    // =========================================================================
    // Widget
    // =========================================================================

    /**
     * Get widget embed script for embedding changelog widget
     * @param projectId Project ID
     * @param params Widget configuration parameters
     * @returns Promise with widget script
     */
    async getWidgetScript(
        projectId: string,
        params?: WidgetScriptParams
    ): Promise<{ script: string }> {
        // Convert parameters to query string
        const queryParams = new URLSearchParams();

        if (params?.theme) queryParams.append('theme', params.theme);
        if (params?.position) queryParams.append('position', params.position);
        if (params?.maxHeight) queryParams.append('maxHeight', params.maxHeight);
        if (params?.isPopup) queryParams.append('popup', params.isPopup.toString());
        if (params?.trigger) queryParams.append('trigger', params.trigger);
        if (params?.maxEntries) queryParams.append('maxEntries', params.maxEntries.toString());

        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

        // Return script tag
        return {
            script: `<script src="${this.config.apiUrl}/integrations/widget/${projectId}${queryString}" async></script>`
        };
    }
}

/**
 * Create a new Changerawr client instance
 * @param config Client configuration
 * @returns Configured client instance
 */
export function createChangerawrClient(config: ChangerawrClientConfig): ChangerawrClient {
    return new ChangerawrClient(config);
}