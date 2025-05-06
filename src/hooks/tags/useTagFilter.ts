import { useState, useCallback, useMemo } from 'react';
import { Tag } from '../../client/types';

/**
 * Options for the useTagFilter hook
 */
export interface UseTagFilterOptions {
    /** Initial array of selected tag IDs */
    initialSelectedTags?: string[];
    /** Whether to allow multiple tags to be selected */
    multiSelect?: boolean;
}

/**
 * Return type for the useTagFilter hook
 */
export interface UseTagFilterResult {
    /** Array of selected tag IDs */
    selectedTags: string[];
    /** Function to check if a tag is selected */
    isTagSelected: (tagId: string) => boolean;
    /** Function to toggle a tag's selection state */
    toggleTag: (tagId: string) => void;
    /** Function to select a specific tag */
    selectTag: (tagId: string) => void;
    /** Function to unselect a specific tag */
    unselectTag: (tagId: string) => void;
    /** Function to select all tags */
    selectAllTags: () => void;
    /** Function to clear all selected tags */
    clearTags: () => void;
    /** Array of selected tag objects (if available) */
    selectedTagObjects: Tag[];
}

/**
 * Hook to manage tag filtering functionality
 * @param availableTags Array of available tags
 * @param options Hook options
 * @returns Tag filtering methods and state
 */
export function useTagFilter(
    availableTags: Tag[] = [],
    options: UseTagFilterOptions = {}
): UseTagFilterResult {
    const { initialSelectedTags = [], multiSelect = true } = options;

    // State for selected tag IDs
    const [selectedTags, setSelectedTags] = useState<string[]>(initialSelectedTags);

    // Check if a tag is selected
    const isTagSelected = useCallback(
        (tagId: string): boolean => selectedTags.includes(tagId),
        [selectedTags]
    );

    // Toggle a tag's selection state
    const toggleTag = useCallback(
        (tagId: string): void => {
            setSelectedTags((prevSelectedTags) => {
                if (prevSelectedTags.includes(tagId)) {
                    return prevSelectedTags.filter((id) => id !== tagId);
                }

                if (multiSelect) {
                    return [...prevSelectedTags, tagId];
                }

                return [tagId];
            });
        },
        [multiSelect]
    );

    // Select a specific tag
    const selectTag = useCallback(
        (tagId: string): void => {
            setSelectedTags((prevSelectedTags) => {
                if (prevSelectedTags.includes(tagId)) {
                    return prevSelectedTags;
                }

                if (multiSelect) {
                    return [...prevSelectedTags, tagId];
                }

                return [tagId];
            });
        },
        [multiSelect]
    );

    // Unselect a specific tag
    const unselectTag = useCallback((tagId: string): void => {
        setSelectedTags((prevSelectedTags) =>
            prevSelectedTags.filter((id) => id !== tagId)
        );
    }, []);

    // Select all tags
    const selectAllTags = useCallback((): void => {
        if (!multiSelect || availableTags.length === 0) {
            return;
        }

        setSelectedTags(availableTags.map((tag) => tag.id));
    }, [availableTags, multiSelect]);

    // Clear all selected tags
    const clearTags = useCallback((): void => {
        setSelectedTags([]);
    }, []);

    // Get selected tag objects
    const selectedTagObjects = useMemo(
        () => availableTags.filter((tag) => selectedTags.includes(tag.id)),
        [availableTags, selectedTags]
    );

    return {
        selectedTags,
        isTagSelected,
        toggleTag,
        selectTag,
        unselectTag,
        selectAllTags,
        clearTags,
        selectedTagObjects,
    };
}