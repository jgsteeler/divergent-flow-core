import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      'packages/div-flo-api',
      'packages/div-flo-core',
      'packages/div-flo-models'
    ]
  }
})