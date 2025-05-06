import React, { useState, useCallback, FormEvent } from 'react';
import { useSubscribe } from '../hooks/subscribers/useSubscribe';
import { useChangerawr } from '../context/ChangerawrProvider';

/**
 * Props for the SubscriptionForm component
 */
export interface SubscriptionFormProps {
    /** Project ID to subscribe to (overrides context) */
    projectId?: string;
    /** CSS class name for the form */
    className?: string;
    /** Inline style for the form */
    style?: React.CSSProperties;
    /** Default subscription type */
    defaultSubscriptionType?: 'ALL_UPDATES' | 'MAJOR_ONLY' | 'DIGEST_ONLY';
    /** Whether to show subscription type selector */
    showSubscriptionType?: boolean;
    /** Label for the email input */
    emailLabel?: string;
    /** Label for the name input */
    nameLabel?: string;
    /** Label for the subscription type selector */
    subscriptionTypeLabel?: string;
    /** Submit button text */
    submitButtonText?: string;
    /** Success message */
    successMessage?: string | ((message: string) => React.ReactNode);
    /** Error message */
    errorMessage?: string | ((error: string) => React.ReactNode);
    /** Callback when subscription is successful */
    onSuccess?: () => void;
    /** Callback when subscription fails */
    onError?: (error: Error) => void;
}

/**
 * A React component that renders a subscription form for the Changerawr changelog
 */
export const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
                                                                      projectId: propProjectId,
                                                                      className,
                                                                      style,
                                                                      defaultSubscriptionType = 'ALL_UPDATES',
                                                                      showSubscriptionType = true,
                                                                      emailLabel = 'Email',
                                                                      nameLabel = 'Name (optional)',
                                                                      subscriptionTypeLabel = 'Updates',
                                                                      submitButtonText = 'Subscribe',
                                                                      successMessage = (message) => message || 'Successfully subscribed!',
                                                                      errorMessage = (error) => error || 'Failed to subscribe. Please try again.',
                                                                      onSuccess,
                                                                      onError,
                                                                  }) => {
    const { projectId: contextProjectId } = useChangerawr();
    const projectId = propProjectId || contextProjectId;

    // Subscription hook
    const {
        subscribe,
        isLoading,
        isSuccess,
        error,
        message,
        reset,
    } = useSubscribe(projectId);

    // Form state
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [subscriptionType, setSubscriptionType] = useState<'ALL_UPDATES' | 'MAJOR_ONLY' | 'DIGEST_ONLY'>(
        defaultSubscriptionType
    );

    // Handle form submission
    const handleSubmit = useCallback(
        async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();

            if (!email) return;

            try {
                await subscribe({
                    email,
                    name: name || undefined,
                    subscriptionType,
                });

                // Clear form on success
                if (onSuccess) {
                    onSuccess();
                }
            } catch (err) {
                if (onError && err instanceof Error) {
                    onError(err);
                }
            }
        },
        [email, name, subscriptionType, subscribe, onSuccess, onError]
    );

    // Reset the form
    const handleReset = useCallback(() => {
        setEmail('');
        setName('');
        setSubscriptionType(defaultSubscriptionType);
        reset();
    }, [defaultSubscriptionType, reset]);

    // Subscription type options
    const subscriptionTypeOptions = [
        { value: 'ALL_UPDATES', label: 'All Updates' },
        { value: 'MAJOR_ONLY', label: 'Major Updates Only' },
        { value: 'DIGEST_ONLY', label: 'Digest' },
    ];

    return (
        <div className={`changerawr-subscription-form-container ${className || ''}`} style={style}>
            {isSuccess ? (
                <div className="changerawr-subscription-success">
                    {typeof successMessage === 'function' ? successMessage(message || '') : successMessage}
                    <button
                        type="button"
                        onClick={handleReset}
                        className="changerawr-subscription-reset-button"
                        style={{
                            marginTop: '12px',
                            padding: '8px 16px',
                            background: '#f5f5f5',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        Subscribe another
                    </button>
                </div>
            ) : (
                <form
                    onSubmit={handleSubmit}
                    className="changerawr-subscription-form"
                    style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label
                            htmlFor="changerawr-email"
                            className="changerawr-subscription-label"
                            style={{ fontWeight: 'bold' }}
                        >
                            {emailLabel}
                        </label>
                        <input
                            id="changerawr-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="changerawr-subscription-input"
                            style={{
                                padding: '8px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label
                            htmlFor="changerawr-name"
                            className="changerawr-subscription-label"
                            style={{ fontWeight: 'bold' }}
                        >
                            {nameLabel}
                        </label>
                        <input
                            id="changerawr-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="changerawr-subscription-input"
                            style={{
                                padding: '8px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                            }}
                        />
                    </div>

                    {showSubscriptionType && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label
                                htmlFor="changerawr-subscription-type"
                                className="changerawr-subscription-label"
                                style={{ fontWeight: 'bold' }}
                            >
                                {subscriptionTypeLabel}
                            </label>
                            <select
                                id="changerawr-subscription-type"
                                value={subscriptionType}
                                onChange={(e) => setSubscriptionType(e.target.value as any)}
                                className="changerawr-subscription-select"
                                style={{
                                    padding: '8px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                }}
                            >
                                {subscriptionTypeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="changerawr-subscription-submit"
                        style={{
                            padding: '10px 16px',
                            background: '#0070f3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isLoading ? 'wait' : 'pointer',
                            opacity: isLoading ? 0.7 : 1,
                            marginTop: '8px',
                        }}
                    >
                        {isLoading ? 'Subscribing...' : submitButtonText}
                    </button>

                    {error && (
                        <div
                            className="changerawr-subscription-error"
                            style={{ color: 'red', marginTop: '8px' }}
                        >
                            {typeof errorMessage === 'function' ? errorMessage(error.message) : errorMessage}
                        </div>
                    )}
                </form>
            )}
        </div>
    );
};