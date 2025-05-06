/**
 * Utility functions for formatting dates, versions, and other data
 */

/**
 * Format a date string to a human-readable form
 * @param dateString ISO date string
 * @param options Formatting options
 * @returns Formatted date string
 */
export function formatDate(
    dateString: string | null | undefined,
    options: {
        format?: 'short' | 'long' | 'relative';
        locale?: string;
    } = {}
): string {
    if (!dateString) return '';

    const { format = 'short', locale = 'en-US' } = options;
    const date = new Date(dateString);

    // Return relative time format
    if (format === 'relative') {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        // Less than a minute
        if (diffInSeconds < 60) {
            return 'just now';
        }

        // Less than an hour
        if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        }

        // Less than a day
        if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        }

        // Less than a week
        if (diffInSeconds < 604800) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days !== 1 ? 's' : ''} ago`;
        }

        // Less than a month
        if (diffInSeconds < 2592000) {
            const weeks = Math.floor(diffInSeconds / 604800);
            return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
        }

        // Fall back to normal date format
    }

    // Format based on specified format
    try {
        if (format === 'long') {
            return new Intl.DateTimeFormat(locale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }).format(date);
        }

        return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(date);
    } catch (error) {
        // Fallback if Intl API fails
        return date.toLocaleDateString();
    }
}

/**
 * Format a version string to a standardized form
 * @param version Version string
 * @returns Formatted version string
 */
export function formatVersion(version: string | null | undefined): string {
    if (!version) return '';

    // Remove leading 'v' if present
    let formatted = version.startsWith('v') ? version.substring(1) : version;

    // Handle semver versions
    const semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
    if (semverRegex.test(formatted)) {
        return `v${formatted}`;
    }

    return formatted;
}

/**
 * Truncate a text string to a specified length
 * @param text Text to truncate
 * @param maxLength Maximum length
 * @param suffix Suffix to add after truncation
 * @returns Truncated text
 */
export function truncateText(
    text: string,
    maxLength: number = 100,
    suffix: string = '...'
): string {
    if (!text || text.length <= maxLength) {
        return text;
    }

    // Find the last space within the limit to avoid cutting words
    const lastSpace = text.substring(0, maxLength).lastIndexOf(' ');
    const truncatedText = lastSpace > 0 ? text.substring(0, lastSpace) : text.substring(0, maxLength);

    return `${truncatedText}${suffix}`;
}

/**
 * Format a number with commas as thousands separators
 * @param value Number to format
 * @returns Formatted number string
 */
export function formatNumber(value: number): string {
    return new Intl.NumberFormat().format(value);
}