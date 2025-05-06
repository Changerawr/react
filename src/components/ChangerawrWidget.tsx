import React, { useEffect, useRef } from 'react';
import { useChangerawr } from '../context/ChangerawrProvider';
import { useWidgetScript } from '../hooks/widget/useWidgetScript';
import { WidgetScriptParams } from '../client/types';

/**
 * Props for the ChangerawrWidget component
 */
export interface ChangerawrWidgetProps extends WidgetScriptParams {
    /** Project ID to display changelog for (overrides context) */
    projectId?: string;
    /** CSS class name for the container element */
    className?: string;
    /** Inline style for the container element */
    style?: React.CSSProperties;
    /** Callback when widget is loaded */
    onLoad?: () => void;
    /** Callback when widget fails to load */
    onError?: (error: Error) => void;
}

/**
 * A React component that embeds the Changerawr widget in your application
 */
export const ChangerawrWidget: React.FC<ChangerawrWidgetProps> = ({
                                                                      projectId: propProjectId,
                                                                      theme = 'light',
                                                                      position = 'bottom-right',
                                                                      maxHeight,
                                                                      isPopup = false,
                                                                      trigger,
                                                                      maxEntries,
                                                                      className,
                                                                      style,
                                                                      onLoad,
                                                                      onError,
                                                                  }) => {
    const { projectId: contextProjectId } = useChangerawr();
    const containerRef = useRef<HTMLDivElement>(null);
    const projectId = propProjectId || contextProjectId;

    // Use the hook to get the widget script
    const { script, error, isLoading } = useWidgetScript(projectId, {
        theme,
        position,
        maxHeight,
        isPopup,
        trigger,
        maxEntries,
    });

    // Handle loading error
    useEffect(() => {
        if (error && onError) {
            onError(error);
        }
    }, [error, onError]);

    // Inject the script into the DOM
    useEffect(() => {
        if (!script || isLoading || !containerRef.current) return;

        const scriptTag = document.createElement('script');

        // Extract script content from the <script> tag
        const scriptContent = script.match(/<script[^>]*>([\s\S]*?)<\/script>/i)?.[1];

        if (scriptContent) {
            scriptTag.textContent = scriptContent;
        } else {
            // If extraction fails, just use the whole script
            scriptTag.textContent = script;
        }

        // The script tag is added to the container
        const container = containerRef.current;
        container.innerHTML = '';
        container.appendChild(scriptTag);

        // Handle the load callback
        if (onLoad) {
            scriptTag.onload = onLoad;
        }

        // Clean up on unmount
        return () => {
            if (container.contains(scriptTag)) {
                container.removeChild(scriptTag);
            }
        };
    }, [script, isLoading, onLoad]);

    // For popup widgets, we need to create a trigger button if none is specified
    useEffect(() => {
        if (isPopup && !trigger && containerRef.current) {
            const container = containerRef.current;

            // If the widget has no trigger element, create one
            if (!trigger && container.querySelector('button') === null) {
                const button = document.createElement('button');
                button.id = `changerawr-trigger-${Math.random().toString(36).substring(2, 9)}`;
                button.textContent = 'Changelog';
                button.className = 'changerawr-widget-trigger';
                button.style.cssText = 'background: #0070f3; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 14px;';

                container.appendChild(button);
            }
        }
    }, [isPopup, trigger]);

    return (
        <div
            ref={containerRef}
            className={`changerawr-widget-container ${className || ''}`}
            style={{
                position: 'relative',
                width: '100%',
                height: isPopup ? 'auto' : (maxHeight || '400px'),
                ...style,
            }}
            data-loading={isLoading || undefined}
            data-error={error ? true : undefined}
        />
    );
};

/**
 * A React component that creates a button to trigger a popup widget
 */
export interface ChangerawrWidgetTriggerProps {
    /** The ID to use for the trigger button */
    id: string;
    /** CSS class name for the button */
    className?: string;
    /** Inline style for the button */
    style?: React.CSSProperties;
    /** Button text */
    children?: React.ReactNode;
}

/**
 * A button component that can be used to trigger a popup widget
 */
export const ChangerawrWidgetTrigger: React.FC<ChangerawrWidgetTriggerProps> = ({
                                                                                    id,
                                                                                    className,
                                                                                    style,
                                                                                    children = 'View Changelog',
                                                                                }) => {
    return (
        <button
            id={id}
            className={`changerawr-widget-trigger ${className || ''}`}
            style={{
                background: '#0070f3',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                ...style,
            }}
        >
            {children}
        </button>
    );
};