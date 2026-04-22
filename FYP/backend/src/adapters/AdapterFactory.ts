import { Provider } from '../models/types';
import { config } from '../config/env';
import { BaseAdapter } from './BaseAdapter';
import { OpenAIAdapter } from './OpenAIAdapter';
import { ClaudeAdapter } from './ClaudeAdapter';
import { MockAdapter } from './MockAdapter';

export class AdapterFactory {
    private static adapters: Map<Provider, BaseAdapter> = new Map();

    static getAdapter(provider: Provider): BaseAdapter {
        if (this.adapters.has(provider)) {
            return this.adapters.get(provider)!;
        }

        let adapter: BaseAdapter;

        if (config.useMockMode) {
            console.log(`[AdapterFactory] Using mock adapter for ${provider} (mock mode enabled)`);
            adapter = new MockAdapter(provider);
        } else {
            switch (provider) {
                case 'openai':
                    adapter = new OpenAIAdapter();
                    break;
                case 'anthropic':
                    adapter = new ClaudeAdapter();
                    break;
                default:
                    throw new Error(`Unknown provider: ${provider}`);
            }
        }

        this.adapters.set(provider, adapter);
        return adapter;
    }

    static getAllAdapters(): BaseAdapter[] {
        const providers: Provider[] = ['openai', 'anthropic'];
        return providers.map(p => this.getAdapter(p));
    }

    static clearCache(): void {
        this.adapters.clear();
    }
}
