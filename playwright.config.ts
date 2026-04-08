import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'https://id-preview--b7aea16e-8d33-4d9c-852a-f487e630989f.lovable.app',
  },
});
