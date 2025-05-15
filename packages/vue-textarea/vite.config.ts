import { defineConfig } from '@copilotkit/vite-config'


// https://vitejs.dev/config/
export default defineConfig({
    build: {
        rollupOptions: {
            external: ['vue','@copilotkit/vue-core','@copilotkit/runtime-client-gql','@copilotkit/shared','element-plus']
        }
    }
})
