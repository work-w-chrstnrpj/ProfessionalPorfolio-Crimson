import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { include: ['application/src/**/*.test.{ts,tsx}'], environment: 'node' } });
