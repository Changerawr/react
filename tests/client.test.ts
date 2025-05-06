import { describe, it, expect } from 'vitest';
import { createChangerawrClient, ChangerawrClient } from '../src/client/api';
import { ChangerawrClientConfig } from '../src/client/types';

describe('Changerawr Client', () => {
    it('should create a client with correct configuration', () => {
        const config: ChangerawrClientConfig = {
            apiUrl: 'https://api.example.com',
            projectId: 'test-project',
            apiKey: 'test-api-key'
        };

        const client = createChangerawrClient(config);

        // Verify client is created successfully
        expect(client).toBeInstanceOf(ChangerawrClient);
    });

    it('should handle basic configuration without optional properties', () => {
        const config: ChangerawrClientConfig = {
            apiUrl: 'https://api.example.com'
        };

        const client = createChangerawrClient(config);

        // Verify client is created successfully
        expect(client).toBeInstanceOf(ChangerawrClient);
    });
});