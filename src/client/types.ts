/**
 * API client configuration options
 */
export interface ChangerawrClientConfig {
    /** The base URL for the Changerawr API */
    apiUrl: string;
    /** Optional project ID for public access */
    projectId?: string;
    /** Optional API key for authenticated access */
    apiKey?: string;
    /** Optional authentication configuration */
    auth?: {
        /** Auth type - 'bearer' for token auth */
        type: 'bearer';
        /** Auth token value */
        token: string;
    };
    /** Request timeout in milliseconds */
    timeout?: number;
}

/**
 * Core entity types
 */

/**
 * Project entity
 */
export interface Project {
    /** Unique project identifier */
    id: string;
    /** Project name */
    name: string;
    /** Whether the project is publicly accessible */
    isPublic: boolean;
    /** Default tags for the project */
    defaultTags?: string[];
    /** Whether auto-publishing is allowed */
    allowAutoPublish?: boolean;
    /** Whether approval is required for changelog entries */
    requireApproval?: boolean;
    /** Creation timestamp */
    createdAt: string;
    /** Last update timestamp */
    updatedAt: string;
}

/**
 * Changelog entry entity
 */
export interface ChangelogEntry {
    /** Unique entry identifier */
    id: string;
    /** Entry title */
    title: string;
    /** Entry content (markdown) */
    content: string;
    /** Version string (e.g. "1.2.3") */
    version?: string;
    /** When the entry was published (null if draft) */
    publishedAt: string | null;
    /** Entry tags */
    tags: Tag[];
    /** Creation timestamp */
    createdAt: string;
    /** Last update timestamp */
    updatedAt: string;
}

/**
 * Tag entity
 */
export interface Tag {
    /** Unique tag identifier */
    id: string;
    /** Tag name */
    name: string;
}

/**
 * Subscriber entity
 */
export interface Subscriber {
    /** Unique subscriber identifier */
    id: string;
    /** Subscriber email */
    email: string;
    /** Optional subscriber name */
    name?: string;
    /** Subscription type */
    subscriptionType: 'ALL_UPDATES' | 'MAJOR_ONLY' | 'DIGEST_ONLY';
    /** Creation timestamp */
    createdAt: string;
    /** Last email sent timestamp */
    lastEmailSentAt: string | null;
}

/**
 * Email configuration
 */
export interface EmailConfig {
    /** Whether email sending is enabled */
    enabled: boolean;
    /** SMTP server hostname */
    smtpHost: string;
    /** SMTP server port */
    smtpPort: number;
    /** SMTP username */
    smtpUser: string;
    /** SMTP secure connection (TLS) */
    smtpSecure: boolean;
    /** Sender email address */
    fromEmail: string;
    /** Optional sender name */
    fromName?: string;
    /** Optional reply-to email */
    replyToEmail?: string;
    /** Default email subject template */
    defaultSubject?: string;
    /** Last test timestamp */
    lastTestedAt?: string;
    /** Test status */
    testStatus?: string;
}

/**
 * Request/Response Types
 */

/**
 * Pagination parameters
 */
export interface PaginationParams {
    /** Page number (1-based) */
    page?: number;
    /** Items per page */
    limit?: number;
}

/**
 * Cursor-based pagination parameters
 */
export interface CursorPaginationParams {
    /** Pagination cursor (entry ID) */
    cursor?: string;
    /** Items per page */
    limit?: number;
}

/**
 * Generic paginated response
 */
export interface PaginatedResponse<T> {
    /** Result items */
    items: T[];
    /** Metadata for pagination */
    pagination: {
        /** Current page number */
        page: number;
        /** Items per page */
        limit: number;
        /** Total item count */
        total: number;
        /** Total page count */
        totalPages: number;
    };
}

/**
 * Cursor-based paginated response
 */
export interface CursorPaginatedResponse<T> {
    /** Result items */
    items: T[];
    /** Optional next cursor for pagination */
    nextCursor?: string;
}

/**
 * Project create/update parameters
 */
export interface ProjectParams {
    /** Project name */
    name: string;
    /** Whether the project is publicly accessible */
    isPublic?: boolean;
    /** Default tags for the project */
    defaultTags?: string[];
    /** Whether auto-publishing is allowed */
    allowAutoPublish?: boolean;
    /** Whether approval is required for changelog entries */
    requireApproval?: boolean;
}

/**
 * Changelog entry create/update parameters
 */
export interface ChangelogEntryParams {
    /** Entry title */
    title: string;
    /** Entry content (markdown) */
    content: string;
    /** Version string (e.g. "1.2.3") */
    version?: string;
    /** Entry tags (names or IDs) */
    tags?: string[];
}

/**
 * Subscription creation parameters
 */
export interface SubscribeParams {
    /** Subscriber email */
    email: string;
    /** Optional subscriber name */
    name?: string;
    /** Subscription type */
    subscriptionType?: 'ALL_UPDATES' | 'MAJOR_ONLY' | 'DIGEST_ONLY';
}

/**
 * Email configuration update parameters
 */
export interface EmailConfigParams {
    /** Whether email sending is enabled */
    enabled?: boolean;
    /** SMTP server hostname */
    smtpHost?: string;
    /** SMTP server port */
    smtpPort?: number;
    /** SMTP username */
    smtpUser?: string;
    /** SMTP password */
    smtpPassword?: string;
    /** SMTP secure connection (TLS) */
    smtpSecure?: boolean;
    /** Sender email address */
    fromEmail?: string;
    /** Optional sender name */
    fromName?: string;
    /** Optional reply-to email */
    replyToEmail?: string;
    /** Default email subject template */
    defaultSubject?: string;
}

/**
 * Email sending parameters
 */
export interface SendEmailParams {
    /** Email subject */
    subject: string;
    /** Changelog entry ID (can be 'digest' for digest emails) */
    changelogEntryId?: string;
    /** Optional direct recipients */
    recipients?: string[];
    /** Flag for sending a digest instead of a single entry */
    isDigest?: boolean;
    /** Subscription types to include */
    subscriptionTypes?: Array<'ALL_UPDATES' | 'MAJOR_ONLY' | 'DIGEST_ONLY'>;
}

/**
 * Widget script parameters
 */
export interface WidgetScriptParams {
    /** Widget theme - light or dark */
    theme?: 'light' | 'dark';
    /** Widget position for popups */
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    /** Maximum height of the widget */
    maxHeight?: string;
    /** Whether to display as a popup */
    isPopup?: boolean;
    /** Trigger element ID or 'immediate' */
    trigger?: string;
    /** Maximum number of entries to display */
    maxEntries?: number;
}

/**
 * API Error response
 */
export interface ApiErrorResponse {
    /** Error message */
    error: string;
    /** Optional error details */
    details?: unknown;
}