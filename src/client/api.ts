import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
    ChangerawrClientConfig,
    Project,
    ProjectParams,
    PaginationParams,
    CursorPaginationParams,
    PaginatedResponse,
    CursorPaginatedResponse,
    ChangelogEntry,
    ChangelogEntryParams,
    Tag,
    Subscriber,
    SubscribeParams,
    EmailConfig,
    EmailConfigParams,
    SendEmailParams,
    WidgetScriptParams,
} from './types';
import { parseApiError } from './errors';

/**
 * Changerawr API client
 * Provides methods for interacting with the Changerawr API
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
    // Projects
    // =========================================================================

    /**
     * Get all projects
     * @param params Optional pagination parameters
     * @returns Promise with paginated project list
     */
    async getProjects(params?: PaginationParams): Promise<PaginatedResponse<Project>> {
        return this.request<PaginatedResponse<Project>>({
            method: 'GET',
            url: '/projects',
            params,
        });
    }

    /**
     * Get a project by ID
     * @param projectId Project ID
     * @returns Promise with project data
     */
    async getProject(projectId: string): Promise<Project> {
        return this.request<Project>({
            method: 'GET',
            url: `/projects/${projectId}`,
        });
    }

    /**
     * Create a new project
     * @param params Project creation parameters
     * @returns Promise with the created project
     */
    async createProject(params: ProjectParams): Promise<Project> {
        return this.request<Project>({
            method: 'POST',
            url: '/projects',
            data: params,
        });
    }

    /**
     * Update a project
     * @param projectId Project ID
     * @param params Project update parameters
     * @returns Promise with the updated project
     */
    async updateProject(projectId: string, params: ProjectParams): Promise<Project> {
        return this.request<Project>({
            method: 'PATCH',
            url: `/projects/${projectId}`,
            data: params,
        });
    }

    /**
     * Delete a project
     * @param projectId Project ID
     * @returns Promise with success status
     */
    async deleteProject(projectId: string): Promise<void> {
        return this.request<void>({
            method: 'DELETE',
            url: `/projects/${projectId}`,
        });
    }

    /**
     * Get project settings
     * @param projectId Project ID
     * @returns Promise with project settings
     */
    async getProjectSettings(projectId: string): Promise<Project> {
        return this.request<Project>({
            method: 'GET',
            url: `/projects/${projectId}/settings`,
        });
    }

    /**
     * Update project settings
     * @param projectId Project ID
     * @param params Project settings parameters
     * @returns Promise with updated project settings
     */
    async updateProjectSettings(projectId: string, params: ProjectParams): Promise<Project> {
        return this.request<Project>({
            method: 'PATCH',
            url: `/projects/${projectId}/settings`,
            data: params,
        });
    }

    // =========================================================================
    // Changelog Entries
    // =========================================================================

    /**
     * Get changelog entries
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
        // Convert tags array to string
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
     * Get changelog entry by ID
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

    /**
     * Create a new changelog entry
     * @param projectId Project ID
     * @param params Entry creation parameters
     * @returns Promise with the created entry
     */
    async createChangelogEntry(projectId: string, params: ChangelogEntryParams): Promise<ChangelogEntry> {
        return this.request<ChangelogEntry>({
            method: 'POST',
            url: `/projects/${projectId}/changelog`,
            data: params,
        });
    }

    /**
     * Update a changelog entry
     * @param projectId Project ID
     * @param entryId Entry ID
     * @param params Entry update parameters
     * @returns Promise with the updated entry
     */
    async updateChangelogEntry(
        projectId: string,
        entryId: string,
        params: ChangelogEntryParams
    ): Promise<ChangelogEntry> {
        return this.request<ChangelogEntry>({
            method: 'PUT',
            url: `/projects/${projectId}/changelog/${entryId}`,
            data: params,
        });
    }

    /**
     * Delete a changelog entry
     * @param projectId Project ID
     * @param entryId Entry ID
     * @returns Promise with success status
     */
    async deleteChangelogEntry(projectId: string, entryId: string): Promise<void> {
        return this.request<void>({
            method: 'DELETE',
            url: `/projects/${projectId}/changelog/${entryId}`,
        });
    }

    /**
     * Publish a changelog entry
     * @param projectId Project ID
     * @param entryId Entry ID
     * @returns Promise with the published entry
     */
    async publishChangelogEntry(projectId: string, entryId: string): Promise<ChangelogEntry> {
        return this.request<ChangelogEntry>({
            method: 'PATCH',
            url: `/projects/${projectId}/changelog/${entryId}`,
            data: { action: 'publish' },
        });
    }

    /**
     * Unpublish a changelog entry
     * @param projectId Project ID
     * @param entryId Entry ID
     * @returns Promise with the unpublished entry
     */
    async unpublishChangelogEntry(projectId: string, entryId: string): Promise<ChangelogEntry> {
        return this.request<ChangelogEntry>({
            method: 'PATCH',
            url: `/projects/${projectId}/changelog/${entryId}`,
            data: { action: 'unpublish' },
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
    // Subscribers
    // =========================================================================

    /**
     * Subscribe to a project
     * @param projectId Project ID
     * @param params Subscription parameters
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
     * Get subscribers for a project (admin only)
     * @param projectId Project ID
     * @param params Optional pagination and search parameters
     * @returns Promise with paginated subscribers
     */
    async getSubscribers(
        projectId: string,
        params?: PaginationParams & {
            search?: string;
        }
    ): Promise<PaginatedResponse<Subscriber>> {
        return this.request<PaginatedResponse<Subscriber>>({
            method: 'GET',
            url: '/subscribers',
            params: {
                ...params,
                projectId,
            },
        });
    }

    /**
     * Unsubscribe a subscriber
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
    // Email
    // =========================================================================

    /**
     * Get email configuration for a project
     * @param projectId Project ID
     * @returns Promise with email configuration
     */
    async getEmailConfig(projectId: string): Promise<EmailConfig> {
        return this.request<EmailConfig>({
            method: 'GET',
            url: `/projects/${projectId}/integrations/email`,
        });
    }

    /**
     * Update email configuration for a project
     * @param projectId Project ID
     * @param params Email configuration parameters
     * @returns Promise with updated email configuration
     */
    async updateEmailConfig(projectId: string, params: EmailConfigParams): Promise<EmailConfig> {
        return this.request<EmailConfig>({
            method: 'POST',
            url: `/projects/${projectId}/integrations/email`,
            data: params,
        });
    }

    /**
     * Test email configuration
     * @param projectId Project ID
     * @param testEmail Email address to send test to
     * @returns Promise with test result
     */
    async testEmailConfig(
        projectId: string,
        testEmail: string
    ): Promise<{ success: boolean, message: string }> {
        return this.request<{ success: boolean, message: string }>({
            method: 'POST',
            url: `/projects/${projectId}/integrations/email/test`,
            data: { testEmail },
        });
    }

    /**
     * Send email notification
     * @param projectId Project ID
     * @param params Email sending parameters
     * @returns Promise with send result
     */
    async sendEmail(
        projectId: string,
        params: SendEmailParams
    ): Promise<{ success: boolean, message: string, recipientCount: number }> {
        return this.request<{ success: boolean, message: string, recipientCount: number }>({
            method: 'POST',
            url: `/projects/${projectId}/integrations/email/send`,
            data: params,
        });
    }

    // =========================================================================
    // Widget
    // =========================================================================

    /**
     * Get widget script for embedding
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