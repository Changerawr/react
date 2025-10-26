import { describe, it, expect, beforeEach } from 'vitest';
import { createChangerawrClient, ChangerawrClient } from '../src/client/api';
import { ChangerawrClientConfig } from '../src/client/types';

describe('Changerawr Client', () => {
    let client: ChangerawrClient;
    const baseConfig: ChangerawrClientConfig = {
        apiUrl: 'https://api.example.com',
        projectId: 'test-project'
    };

    beforeEach(() => {
        client = createChangerawrClient(baseConfig);
    });

    describe('Client Creation', () => {
        it('should create a client with correct configuration', () => {
            const config: ChangerawrClientConfig = {
                apiUrl: 'https://api.example.com',
                projectId: 'test-project',
                apiKey: 'test-api-key'
            };

            const clientWithKey = createChangerawrClient(config);

            // Verify client is created successfully
            expect(clientWithKey).toBeInstanceOf(ChangerawrClient);
        });

        it('should handle basic configuration without optional properties', () => {
            const config: ChangerawrClientConfig = {
                apiUrl: 'https://api.example.com'
            };

            const minimalClient = createChangerawrClient(config);

            // Verify client is created successfully
            expect(minimalClient).toBeInstanceOf(ChangerawrClient);
        });

        it('should create client with bearer token auth', () => {
            const config: ChangerawrClientConfig = {
                apiUrl: 'https://api.example.com',
                projectId: 'test-project',
                auth: {
                    type: 'bearer',
                    token: 'test-bearer-token'
                }
            };

            const clientWithAuth = createChangerawrClient(config);
            expect(clientWithAuth).toBeInstanceOf(ChangerawrClient);
        });

        it('should create client with custom timeout', () => {
            const config: ChangerawrClientConfig = {
                apiUrl: 'https://api.example.com',
                projectId: 'test-project',
                timeout: 60000
            };

            const clientWithTimeout = createChangerawrClient(config);
            expect(clientWithTimeout).toBeInstanceOf(ChangerawrClient);
        });
    });

    describe('API Methods', () => {
        it('should have getChangelog method', () => {
            expect(typeof client.getChangelog).toBe('function');
        });

        it('should have getChangelogEntry method', () => {
            expect(typeof client.getChangelogEntry).toBe('function');
        });

        it('should have getTags method', () => {
            expect(typeof client.getTags).toBe('function');
        });

        it('should have subscribe method', () => {
            expect(typeof client.subscribe).toBe('function');
        });

        it('should have unsubscribe method', () => {
            expect(typeof client.unsubscribe).toBe('function');
        });

        it('should have getWidgetScript method', () => {
            expect(typeof client.getWidgetScript).toBe('function');
        });

        it('should NOT have admin methods', () => {
            // Verify admin methods are removed
            expect((client as any).createProject).toBeUndefined();
            expect((client as any).updateProject).toBeUndefined();
            expect((client as any).deleteProject).toBeUndefined();
            expect((client as any).createChangelogEntry).toBeUndefined();
            expect((client as any).updateChangelogEntry).toBeUndefined();
            expect((client as any).deleteChangelogEntry).toBeUndefined();
            expect((client as any).getEmailConfig).toBeUndefined();
            expect((client as any).sendEmail).toBeUndefined();
        });
    });

    describe('Widget Script Generation', () => {
        it('should generate widget script with basic config', async () => {
            const result = await client.getWidgetScript('test-project');

            expect(result).toHaveProperty('script');
            expect(result.script).toContain('<script src=');
            expect(result.script).toContain('test-project');
            expect(result.script).toContain('async');
        });

        it('should generate widget script with theme parameter', async () => {
            const result = await client.getWidgetScript('test-project', {
                theme: 'dark'
            });

            expect(result.script).toContain('theme=dark');
        });

        it('should generate widget script with multiple parameters', async () => {
            const result = await client.getWidgetScript('test-project', {
                theme: 'dark',
                position: 'bottom-right',
                isPopup: true,
                maxEntries: 5
            });

            expect(result.script).toContain('theme=dark');
            expect(result.script).toContain('position=bottom-right');
            expect(result.script).toContain('popup=true');
            expect(result.script).toContain('maxEntries=5');
        });
    });
});